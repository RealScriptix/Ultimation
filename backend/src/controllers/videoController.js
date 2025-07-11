const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Video = require('../models/Video');
const User = require('../models/User');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const uploadService = require('../services/uploadService');
const videoProcessingService = require('../services/videoProcessingService');
const recommendationService = require('../services/recommendationService');
const analyticsService = require('../services/analyticsService');
const notificationService = require('../services/notificationService');

// @desc    Get trending videos
// @route   GET /api/videos/trending
// @access  Public
exports.getTrending = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;
  const skip = (page - 1) * limit;

  const videos = await Video.findTrending(parseInt(limit), category)
    .skip(skip);

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Get viral videos
// @route   GET /api/videos/viral
// @access  Public
exports.getViral = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const videos = await Video.findViral(parseInt(limit))
    .skip(skip);

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Get videos by category
// @route   GET /api/videos/category/:category
// @access  Public
exports.getByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const videos = await Video.findByCategory(category, parseInt(limit), skip);

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Get videos by hashtag
// @route   GET /api/videos/hashtag/:hashtag
// @access  Public
exports.getByHashtag = asyncHandler(async (req, res) => {
  const { hashtag } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const videos = await Video.findByHashtags([hashtag], parseInt(limit));

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Search videos
// @route   GET /api/videos/search
// @access  Public
exports.search = asyncHandler(async (req, res) => {
  const { q, category, duration, sortBy = 'relevance', page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  let query = {
    $text: { $search: q },
    isPublic: true,
    visibility: 'public',
    'moderation.isApproved': true,
    'processing.status': 'completed'
  };

  if (category) {
    query.category = category;
  }

  if (duration) {
    const durationRanges = {
      'short': { $lt: 60 },
      'medium': { $gte: 60, $lt: 180 },
      'long': { $gte: 180 }
    };
    query.duration = durationRanges[duration];
  }

  let sortOptions = {};
  switch (sortBy) {
    case 'views':
      sortOptions = { 'stats.viewsCount': -1 };
      break;
    case 'likes':
      sortOptions = { 'stats.likesCount': -1 };
      break;
    case 'recent':
      sortOptions = { createdAt: -1 };
      break;
    default:
      sortOptions = { score: { $meta: 'textScore' } };
  }

  const videos = await Video.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'username displayName avatar isVerified');

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
exports.getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate('creator', 'username displayName avatar isVerified stats.followersCount')
    .populate('collaborators.user', 'username displayName avatar isVerified')
    .populate('audio.musicId', 'title artist');

  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Check if video is accessible
  if (!video.isPublic && video.visibility !== 'public') {
    if (!req.user || (!video.creator.equals(req.user.id) && video.visibility === 'private')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }

  let userEngagement = null;
  if (req.user) {
    const like = await Like.findOne({
      user: req.user.id,
      targetType: 'Video',
      targetId: video._id
    });

    const isFollowing = await Follow.isFollowing(req.user.id, video.creator._id);

    userEngagement = {
      isLiked: !!like,
      isFollowing: !!isFollowing,
      likeType: like ? like.type : null
    };
  }

  res.json({
    success: true,
    data: {
      ...video.toObject(),
      userEngagement
    }
  });
});

// @desc    Record video view
// @route   POST /api/videos/:id/view
// @access  Public
exports.recordView = asyncHandler(async (req, res) => {
  const { watchTime = 0, deviceInfo = {}, location = {} } = req.body;

  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Update video view count and analytics
  await video.incrementViews(watchTime);
  
  // Add analytics data
  const analyticsData = {
    country: location.country,
    device: deviceInfo.type || 'unknown',
    ...deviceInfo
  };
  
  await video.addViewAnalytics(analyticsData);

  // Update creator's view count
  await User.findByIdAndUpdate(video.creator, {
    $inc: { 'stats.viewsCount': 1 }
  });

  res.json({
    success: true,
    message: 'View recorded'
  });
});

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private
exports.uploadVideo = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Video file is required'
    });
  }

  const { title, description, category, tags, hashtags, visibility = 'public' } = req.body;

  // Upload video to cloud storage
  const uploadResult = await uploadService.uploadVideo(req.file);

  // Create video document
  const video = await Video.create({
    title,
    description,
    category,
    tags: tags ? JSON.parse(tags) : [],
    hashtags: hashtags ? JSON.parse(hashtags) : [],
    visibility,
    creator: req.user.id,
    videoUrl: uploadResult.videoUrl,
    thumbnailUrl: uploadResult.thumbnailUrl,
    originalVideoUrl: uploadResult.originalUrl,
    duration: uploadResult.duration,
    resolution: uploadResult.resolution,
    fileSize: uploadResult.fileSize,
    processing: {
      status: 'processing',
      processingStartedAt: new Date()
    }
  });

  // Start background video processing
  videoProcessingService.processVideo(video._id);

  // Update user's video count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { 'stats.videosCount': 1 }
  });

  res.status(201).json({
    success: true,
    data: video,
    message: 'Video uploaded successfully and is being processed'
  });
});

// @desc    Get user's videos
// @route   GET /api/videos/my/videos
// @access  Private
exports.getMyVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'all' } = req.query;
  const skip = (page - 1) * limit;

  let query = { creator: req.user.id };
  
  if (status !== 'all') {
    query['processing.status'] = status;
  }

  const videos = await Video.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'username displayName avatar isVerified');

  res.json({
    success: true,
    data: videos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Get personalized feed
// @route   GET /api/videos/feed/personalized
// @access  Private
exports.getPersonalizedFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user.id);
  
  // Get personalized videos based on user interests
  const videos = await Video.getPersonalizedFeed(
    req.user.id,
    user.interests,
    parseInt(limit)
  ).skip(skip);

  // Add user engagement data
  const videosWithEngagement = await Promise.all(
    videos.map(async (video) => {
      const like = await Like.findOne({
        user: req.user.id,
        targetType: 'Video',
        targetId: video._id
      });

      const isFollowing = await Follow.isFollowing(req.user.id, video.creator._id);

      return {
        ...video.toObject(),
        userEngagement: {
          isLiked: !!like,
          isFollowing: !!isFollowing,
          likeType: like ? like.type : null
        }
      };
    })
  );

  res.json({
    success: true,
    data: videosWithEngagement,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: videos.length === parseInt(limit)
    }
  });
});

// @desc    Like video (Swipe Right)
// @route   POST /api/videos/:id/like
// @access  Private
exports.likeVideo = asyncHandler(async (req, res) => {
  const { type = 'like' } = req.body;

  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Check if user already liked this video
  const existingLike = await Like.findOne({
    user: req.user.id,
    targetType: 'Video',
    targetId: video._id
  });

  if (existingLike) {
    // Update existing like
    existingLike.type = type;
    await existingLike.save();
  } else {
    // Create new like
    await Like.create({
      user: req.user.id,
      targetType: 'Video',
      targetId: video._id,
      type
    });

    // Increment video likes count
    await video.incrementLikes();

    // Update creator's likes count
    await User.findByIdAndUpdate(video.creator, {
      $inc: { 'stats.likesCount': 1 }
    });

    // Send notification to video creator
    if (!video.creator.equals(req.user.id)) {
      notificationService.createNotification({
        recipient: video.creator,
        sender: req.user.id,
        type: 'like',
        targetType: 'Video',
        targetId: video._id,
        message: `${req.user.username} liked your video`
      });
    }
  }

  res.json({
    success: true,
    message: 'Video liked successfully'
  });
});

// @desc    Unlike video
// @route   DELETE /api/videos/:id/like
// @access  Private
exports.unlikeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  const like = await Like.findOneAndDelete({
    user: req.user.id,
    targetType: 'Video',
    targetId: video._id
  });

  if (like) {
    // Decrement video likes count
    await video.decrementLikes();

    // Update creator's likes count
    await User.findByIdAndUpdate(video.creator, {
      $inc: { 'stats.likesCount': -1 }
    });
  }

  res.json({
    success: true,
    message: 'Video unliked successfully'
  });
});

// @desc    Swipe right (Like video)
// @route   POST /api/videos/swipe/right/:id
// @access  Private
exports.swipeRight = asyncHandler(async (req, res) => {
  // Same as likeVideo but with swipe tracking
  await exports.likeVideo(req, res);
  
  // Track swipe analytics
  analyticsService.trackSwipe(req.user.id, req.params.id, 'right');
});

// @desc    Swipe left (Next video)
// @route   POST /api/videos/swipe/left/:id
// @access  Private
exports.swipeLeft = asyncHandler(async (req, res) => {
  const { watchTime = 0 } = req.body;

  // Record view if user watched for a certain time
  if (watchTime > 3) { // 3 seconds minimum
    await exports.recordView(req, res);
  }

  // Get next video recommendation
  const nextVideo = await recommendationService.getNextVideo(req.user.id, req.params.id);

  // Track swipe analytics
  analyticsService.trackSwipe(req.user.id, req.params.id, 'left');

  res.json({
    success: true,
    data: nextVideo,
    message: 'Next video loaded'
  });
});

// @desc    Swipe down (View channel)
// @route   POST /api/videos/swipe/down/:id
// @access  Private
exports.swipeDown = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate('creator', 'username displayName avatar isVerified bio stats socialLinks');

  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Get more videos from this creator
  const moreVideos = await Video.find({
    creator: video.creator._id,
    _id: { $ne: video._id },
    isPublic: true,
    visibility: 'public',
    'processing.status': 'completed'
  })
  .sort({ 'stats.viewsCount': -1 })
  .limit(20)
  .populate('creator', 'username displayName avatar isVerified');

  // Check if user is following this creator
  const isFollowing = await Follow.isFollowing(req.user.id, video.creator._id);

  // Track swipe analytics
  analyticsService.trackSwipe(req.user.id, req.params.id, 'down');

  res.json({
    success: true,
    data: {
      creator: video.creator,
      videos: moreVideos,
      isFollowing: !!isFollowing
    },
    message: 'Channel data loaded'
  });
});

// @desc    Swipe up (Previous video)
// @route   POST /api/videos/swipe/up/:id
// @access  Private
exports.swipeUp = asyncHandler(async (req, res) => {
  // Get previous video from user's viewing history
  const previousVideo = await recommendationService.getPreviousVideo(req.user.id, req.params.id);

  // Track swipe analytics
  analyticsService.trackSwipe(req.user.id, req.params.id, 'up');

  res.json({
    success: true,
    data: previousVideo,
    message: 'Previous video loaded'
  });
});

// @desc    Get video comments
// @route   GET /api/videos/:id/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const comments = await Comment.findByVideo(req.params.id, parseInt(limit), skip);

  res.json({
    success: true,
    data: comments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: comments.length === parseInt(limit)
    }
  });
});

// @desc    Add comment to video
// @route   POST /api/videos/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Comment content is required'
    });
  }

  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  const comment = await Comment.create({
    content: content.trim(),
    author: req.user.id,
    video: video._id
  });

  await comment.populate('author', 'username displayName avatar isVerified');

  // Increment video comments count
  await video.incrementComments();

  // Update creator's comments count
  await User.findByIdAndUpdate(video.creator, {
    $inc: { 'stats.commentsCount': 1 }
  });

  // Send notification to video creator
  if (!video.creator.equals(req.user.id)) {
    notificationService.createNotification({
      recipient: video.creator,
      sender: req.user.id,
      type: 'comment',
      targetType: 'Video',
      targetId: video._id,
      message: `${req.user.username} commented on your video`
    });
  }

  res.status(201).json({
    success: true,
    data: comment,
    message: 'Comment added successfully'
  });
});

// @desc    Share video
// @route   POST /api/videos/:id/share
// @access  Private
exports.shareVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Increment video shares count
  await video.incrementShares();

  // Update creator's shares count
  await User.findByIdAndUpdate(video.creator, {
    $inc: { 'stats.sharesCount': 1 }
  });

  res.json({
    success: true,
    message: 'Video shared successfully'
  });
});

// @desc    Get video recommendations
// @route   GET /api/videos/recommendations/:id
// @access  Private
exports.getRecommendations = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const recommendations = await recommendationService.getRecommendations(
    req.user.id,
    req.params.id,
    parseInt(limit)
  );

  res.json({
    success: true,
    data: recommendations
  });
});

// @desc    Update video
// @route   PATCH /api/videos/:id
// @access  Private
exports.updateVideo = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Check if user owns this video
  if (!video.creator.equals(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const allowedUpdates = ['title', 'description', 'category', 'tags', 'hashtags', 'visibility'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedVideo = await Video.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('creator', 'username displayName avatar isVerified');

  res.json({
    success: true,
    data: updatedVideo,
    message: 'Video updated successfully'
  });
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
exports.deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  // Check if user owns this video
  if (!video.creator.equals(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Delete video file from cloud storage
  await uploadService.deleteVideo(video.videoUrl);

  // Delete video document
  await video.deleteOne();

  // Update user's video count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { 'stats.videosCount': -1 }
  });

  res.json({
    success: true,
    message: 'Video deleted successfully'
  });
});

module.exports = exports;