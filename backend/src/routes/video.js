const express = require('express');
const { body, query, param } = require('express-validator');
const videoController = require('../controllers/videoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for video operations
const videoUploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 video uploads per windowMs
  message: 'Too many video uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const videoViewLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 video views per minute
  message: 'Too many video views, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateVideoUpload = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),
  
  body('category')
    .isIn(['gaming', 'music', 'sports', 'comedy', 'education', 'tech', 'food', 
           'travel', 'fashion', 'beauty', 'fitness', 'dance', 'art', 'diy', 
           'pets', 'lifestyle', 'news', 'entertainment', 'automotive', 'nature'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('hashtags')
    .optional()
    .isArray()
    .withMessage('Hashtags must be an array'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'unlisted', 'followers'])
    .withMessage('Invalid visibility setting')
];

const validateVideoUpdate = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),
  
  body('category')
    .optional()
    .isIn(['gaming', 'music', 'sports', 'comedy', 'education', 'tech', 'food', 
           'travel', 'fashion', 'beauty', 'fitness', 'dance', 'art', 'diy', 
           'pets', 'lifestyle', 'news', 'entertainment', 'automotive', 'nature'])
    .withMessage('Invalid category'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'unlisted', 'followers'])
    .withMessage('Invalid visibility setting')
];

// Public routes
router.get('/trending', videoController.getTrending);
router.get('/viral', videoController.getViral);
router.get('/category/:category', videoController.getByCategory);
router.get('/hashtag/:hashtag', videoController.getByHashtag);
router.get('/search', videoController.search);
router.get('/:id', videoController.getVideo);
router.post('/:id/view', videoViewLimit, videoController.recordView);

// Protected routes
router.use(auth);

// Video management
router.post('/upload', videoUploadLimit, upload.single('video'), validateVideoUpload, videoController.uploadVideo);
router.get('/my/videos', videoController.getMyVideos);
router.get('/my/drafts', videoController.getMyDrafts);
router.patch('/:id', validateVideoUpdate, videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

// Feed and recommendations
router.get('/feed/personalized', videoController.getPersonalizedFeed);
router.get('/feed/following', videoController.getFollowingFeed);
router.get('/feed/interests', videoController.getInterestsFeed);

// Engagement actions
router.post('/:id/like', videoController.likeVideo);
router.delete('/:id/like', videoController.unlikeVideo);
router.post('/:id/save', videoController.saveVideo);
router.delete('/:id/save', videoController.unsaveVideo);
router.post('/:id/share', videoController.shareVideo);
router.post('/:id/report', videoController.reportVideo);

// Comments
router.get('/:id/comments', videoController.getComments);
router.post('/:id/comments', videoController.addComment);

// Video processing status
router.get('/:id/status', videoController.getProcessingStatus);

// Analytics (creator only)
router.get('/:id/analytics', videoController.getAnalytics);

// Swipe functionality - key feature for short video app
router.post('/swipe/right/:id', videoController.swipeRight); // Like video
router.post('/swipe/left/:id', videoController.swipeLeft);  // Next video
router.post('/swipe/down/:id', videoController.swipeDown);  // View channel
router.post('/swipe/up/:id', videoController.swipeUp);      // Previous video

// Advanced features
router.get('/recommendations/:id', videoController.getRecommendations);
router.post('/:id/collaborate', videoController.requestCollaboration);
router.get('/duets/:id', videoController.getDuets);
router.post('/:id/duet', videoController.createDuet);

// Bulk operations
router.post('/bulk/delete', videoController.bulkDelete);
router.post('/bulk/update', videoController.bulkUpdate);

module.exports = router;