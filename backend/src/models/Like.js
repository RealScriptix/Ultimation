const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  // User who liked
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Target of the like (video or comment)
  targetType: {
    type: String,
    enum: ['Video', 'Comment'],
    required: [true, 'Target type is required']
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetType'
  },
  
  // Like type
  type: {
    type: String,
    enum: ['like', 'dislike', 'love', 'laugh', 'wow', 'sad', 'angry'],
    default: 'like'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique likes
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Individual indexes for performance
likeSchema.index({ user: 1, createdAt: -1 });
likeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
likeSchema.index({ type: 1 });

// Static method to check if user liked a target
likeSchema.statics.isLiked = function(userId, targetType, targetId) {
  return this.findOne({
    user: userId,
    targetType,
    targetId
  });
};

// Static method to get likes for a target
likeSchema.statics.getLikes = function(targetType, targetId, limit = 20, skip = 0) {
  return this.find({
    targetType,
    targetId
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('user', 'username displayName avatar isVerified');
};

// Static method to get user's liked videos
likeSchema.statics.getUserLikedVideos = function(userId, limit = 20, skip = 0) {
  return this.find({
    user: userId,
    targetType: 'Video'
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('targetId', 'title thumbnailUrl duration stats creator')
  .populate({
    path: 'targetId',
    populate: {
      path: 'creator',
      select: 'username displayName avatar isVerified'
    }
  });
};

module.exports = mongoose.model('Like', likeSchema);