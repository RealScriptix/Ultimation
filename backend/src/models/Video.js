const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Video title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Video description cannot exceed 2000 characters']
  },
  
  // Creator Information
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Video creator is required']
  },
  
  // Video Files and Media
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  
  // Video Processing Information
  originalVideoUrl: String,
  processedVideoUrl: String,
  videoSizes: [{
    quality: {
      type: String,
      enum: ['240p', '360p', '480p', '720p', '1080p']
    },
    url: String,
    size: Number // in bytes
  }],
  
  // Video Properties
  duration: {
    type: Number,
    required: [true, 'Video duration is required'],
    min: [1, 'Video duration must be at least 1 second'],
    max: [300, 'Video duration cannot exceed 5 minutes'] // 5 minutes max
  },
  format: {
    type: String,
    enum: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    default: 'mp4'
  },
  resolution: {
    width: Number,
    height: Number
  },
  aspectRatio: {
    type: String,
    enum: ['9:16', '16:9', '1:1', '4:3', '3:4'],
    default: '9:16'
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  
  // Content Classification
  category: {
    type: String,
    required: [true, 'Video category is required'],
    enum: [
      'gaming', 'music', 'sports', 'comedy', 'education', 'tech', 'food', 
      'travel', 'fashion', 'beauty', 'fitness', 'dance', 'art', 'diy', 
      'pets', 'lifestyle', 'news', 'entertainment', 'automotive', 'nature'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Hashtag can only contain letters, numbers, and underscores']
  }],
  
  // Privacy and Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted', 'followers'],
    default: 'public'
  },
  
  // Engagement Statistics
  stats: {
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    reportsCount: { type: Number, default: 0 },
    
    // Engagement rates
    engagementRate: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageWatchTime: { type: Number, default: 0 },
    
    // Trending metrics
    trendingScore: { type: Number, default: 0 },
    viralScore: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 }
  },
  
  // Content Moderation
  moderation: {
    isReviewed: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    
    // Content warnings
    contentWarnings: [{
      type: String,
      enum: ['explicit', 'violence', 'disturbing', 'flashing', 'loud']
    }],
    
    // Age restriction
    ageRestriction: {
      type: String,
      enum: ['none', '13+', '16+', '18+'],
      default: 'none'
    }
  },
  
  // Audio Information
  audio: {
    hasAudio: { type: Boolean, default: true },
    audioUrl: String,
    originalAudioUrl: String,
    musicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Music'
    },
    volume: { type: Number, default: 1.0 },
    audioTracks: [{
      name: String,
      artist: String,
      duration: Number,
      startTime: Number,
      endTime: Number
    }]
  },
  
  // Location Information
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    country: String,
    placeName: String,
    isLocationVisible: { type: Boolean, default: false }
  },
  
  // Collaboration and Mentions
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['featured', 'mentioned', 'collaborated'],
      default: 'mentioned'
    }
  }],
  
  // Video Effects and Filters
  effects: {
    filters: [{
      name: String,
      intensity: { type: Number, min: 0, max: 1 }
    }],
    transitions: [String],
    specialEffects: [String]
  },
  
  // Monetization
  monetization: {
    isMonetized: { type: Boolean, default: false },
    adRevenue: { type: Number, default: 0 },
    sponsorshipRevenue: { type: Number, default: 0 },
    tipRevenue: { type: Number, default: 0 },
    
    // Sponsorship info
    isSponsored: { type: Boolean, default: false },
    sponsorInfo: {
      brand: String,
      campaign: String,
      paymentAmount: Number
    }
  },
  
  // Analytics and Performance
  analytics: {
    // Geographic data
    viewsByCountry: [{
      country: String,
      views: Number
    }],
    
    // Demographic data
    viewsByAge: [{
      ageRange: String,
      views: Number
    }],
    viewsByGender: [{
      gender: String,
      views: Number
    }],
    
    // Device and platform data
    viewsByDevice: [{
      device: String,
      views: Number
    }],
    
    // Time-based data
    viewsByHour: [{
      hour: Number,
      views: Number
    }],
    
    // Traffic sources
    trafficSources: [{
      source: String,
      views: Number
    }],
    
    // Retention data
    retentionGraph: [{
      timestamp: Number,
      retentionRate: Number
    }]
  },
  
  // Related Videos and Recommendations
  relatedVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  
  // Upload and Processing Status
  processing: {
    status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed'],
      default: 'uploading'
    },
    progress: { type: Number, default: 0 },
    error: String,
    processingStartedAt: Date,
    processingCompletedAt: Date
  },
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: Date.now
  },
  lastEngagementAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
videoSchema.index({ creator: 1, createdAt: -1 });
videoSchema.index({ category: 1, 'stats.viewsCount': -1 });
videoSchema.index({ hashtags: 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ 'stats.trendingScore': -1 });
videoSchema.index({ 'stats.viralScore': -1 });
videoSchema.index({ publishedAt: -1 });
videoSchema.index({ isPublic: 1, visibility: 1 });
videoSchema.index({ 'moderation.isApproved': 1 });
videoSchema.index({ 'processing.status': 1 });

// Text search index
videoSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  hashtags: 'text'
});

// Geospatial index
videoSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Virtual for video URL with CDN
videoSchema.virtual('videoUrlWithCDN').get(function() {
  return `${process.env.CDN_URL}/${this.videoUrl}`;
});

// Virtual for thumbnail URL with CDN
videoSchema.virtual('thumbnailUrlWithCDN').get(function() {
  return `${process.env.CDN_URL}/${this.thumbnailUrl}`;
});

// Virtual for engagement rate calculation
videoSchema.virtual('engagementRateCalculated').get(function() {
  if (this.stats.viewsCount === 0) return 0;
  const totalEngagements = this.stats.likesCount + this.stats.commentsCount + this.stats.sharesCount;
  return ((totalEngagements / this.stats.viewsCount) * 100).toFixed(2);
});

// Virtual for video age in days
videoSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.publishedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted duration
videoSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Pre-save middleware to calculate scores
videoSchema.pre('save', function(next) {
  // Calculate engagement rate
  if (this.stats.viewsCount > 0) {
    const totalEngagements = this.stats.likesCount + this.stats.commentsCount + this.stats.sharesCount;
    this.stats.engagementRate = (totalEngagements / this.stats.viewsCount) * 100;
  }
  
  // Calculate trending score (simple algorithm)
  const ageInHours = (Date.now() - this.publishedAt) / (1000 * 60 * 60);
  const decayFactor = Math.exp(-ageInHours / 24); // 24-hour decay
  this.stats.trendingScore = (this.stats.viewsCount * 0.4 + 
                             this.stats.likesCount * 0.3 + 
                             this.stats.commentsCount * 0.2 + 
                             this.stats.sharesCount * 0.1) * decayFactor;
  
  // Calculate viral score
  this.stats.viralScore = this.stats.sharesCount * 10 + this.stats.likesCount * 2;
  
  // Update last engagement time if stats changed
  if (this.isModified('stats')) {
    this.lastEngagementAt = Date.now();
  }
  
  next();
});

// Instance method to increment view count
videoSchema.methods.incrementViews = function(watchTime = 0) {
  this.stats.viewsCount += 1;
  
  // Update average watch time
  const currentTotal = this.stats.averageWatchTime * (this.stats.viewsCount - 1);
  this.stats.averageWatchTime = (currentTotal + watchTime) / this.stats.viewsCount;
  
  // Update completion rate
  if (watchTime > 0) {
    const completionRate = (watchTime / this.duration) * 100;
    const currentTotalCompletion = this.stats.completionRate * (this.stats.viewsCount - 1);
    this.stats.completionRate = (currentTotalCompletion + completionRate) / this.stats.viewsCount;
  }
  
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment likes
videoSchema.methods.incrementLikes = function() {
  this.stats.likesCount += 1;
  this.lastEngagementAt = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Instance method to decrement likes
videoSchema.methods.decrementLikes = function() {
  this.stats.likesCount = Math.max(0, this.stats.likesCount - 1);
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment comments
videoSchema.methods.incrementComments = function() {
  this.stats.commentsCount += 1;
  this.lastEngagementAt = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Instance method to decrement comments
videoSchema.methods.decrementComments = function() {
  this.stats.commentsCount = Math.max(0, this.stats.commentsCount - 1);
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment shares
videoSchema.methods.incrementShares = function() {
  this.stats.sharesCount += 1;
  this.lastEngagementAt = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Instance method to add view analytics
videoSchema.methods.addViewAnalytics = function(analyticsData) {
  // Add country view
  if (analyticsData.country) {
    const countryView = this.analytics.viewsByCountry.find(v => v.country === analyticsData.country);
    if (countryView) {
      countryView.views += 1;
    } else {
      this.analytics.viewsByCountry.push({ country: analyticsData.country, views: 1 });
    }
  }
  
  // Add device view
  if (analyticsData.device) {
    const deviceView = this.analytics.viewsByDevice.find(v => v.device === analyticsData.device);
    if (deviceView) {
      deviceView.views += 1;
    } else {
      this.analytics.viewsByDevice.push({ device: analyticsData.device, views: 1 });
    }
  }
  
  // Add hourly view
  const hour = new Date().getHours();
  const hourView = this.analytics.viewsByHour.find(v => v.hour === hour);
  if (hourView) {
    hourView.views += 1;
  } else {
    this.analytics.viewsByHour.push({ hour, views: 1 });
  }
  
  return this.save({ validateBeforeSave: false });
};

// Static method to find trending videos
videoSchema.statics.findTrending = function(limit = 20, category = null) {
  const query = {
    isPublic: true,
    visibility: 'public',
    'moderation.isApproved': true,
    'processing.status': 'completed'
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ 'stats.trendingScore': -1 })
    .limit(limit)
    .populate('creator', 'username displayName avatar isVerified')
    .populate('audio.musicId', 'title artist');
};

// Static method to find viral videos
videoSchema.statics.findViral = function(limit = 20) {
  return this.find({
    isPublic: true,
    visibility: 'public',
    'moderation.isApproved': true,
    'processing.status': 'completed',
    'stats.viralScore': { $gte: 100 }
  })
  .sort({ 'stats.viralScore': -1 })
  .limit(limit)
  .populate('creator', 'username displayName avatar isVerified');
};

// Static method to find videos by category
videoSchema.statics.findByCategory = function(category, limit = 20, skip = 0) {
  return this.find({
    category,
    isPublic: true,
    visibility: 'public',
    'moderation.isApproved': true,
    'processing.status': 'completed'
  })
  .sort({ 'stats.viewsCount': -1 })
  .skip(skip)
  .limit(limit)
  .populate('creator', 'username displayName avatar isVerified');
};

// Static method to find videos by hashtags
videoSchema.statics.findByHashtags = function(hashtags, limit = 20) {
  return this.find({
    hashtags: { $in: hashtags },
    isPublic: true,
    visibility: 'public',
    'moderation.isApproved': true,
    'processing.status': 'completed'
  })
  .sort({ 'stats.viewsCount': -1 })
  .limit(limit)
  .populate('creator', 'username displayName avatar isVerified');
};

// Static method to get personalized feed
videoSchema.statics.getPersonalizedFeed = function(userId, interests, limit = 20) {
  return this.find({
    creator: { $ne: userId },
    category: { $in: interests },
    isPublic: true,
    visibility: 'public',
    'moderation.isApproved': true,
    'processing.status': 'completed'
  })
  .sort({ 'stats.trendingScore': -1, createdAt: -1 })
  .limit(limit)
  .populate('creator', 'username displayName avatar isVerified');
};

module.exports = mongoose.model('Video', videoSchema);