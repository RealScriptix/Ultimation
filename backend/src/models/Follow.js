const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // User who is following
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Follower is required']
  },
  
  // User being followed
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Following user is required']
  },
  
  // Follow type
  type: {
    type: String,
    enum: ['follow', 'subscribe', 'close_friend'],
    default: 'follow'
  },
  
  // Notification preferences
  notifications: {
    newVideos: { type: Boolean, default: true },
    liveStreams: { type: Boolean, default: true },
    posts: { type: Boolean, default: true }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'accepted'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Individual indexes for performance
followSchema.index({ follower: 1, createdAt: -1 });
followSchema.index({ following: 1, createdAt: -1 });
followSchema.index({ status: 1 });

// Prevent users from following themselves
followSchema.pre('save', function(next) {
  if (this.follower.equals(this.following)) {
    return next(new Error('Users cannot follow themselves'));
  }
  next();
});

// Static method to check if user is following another user
followSchema.statics.isFollowing = function(followerId, followingId) {
  return this.findOne({
    follower: followerId,
    following: followingId,
    status: 'accepted'
  });
};

// Static method to get followers
followSchema.statics.getFollowers = function(userId, limit = 20, skip = 0) {
  return this.find({
    following: userId,
    status: 'accepted'
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('follower', 'username displayName avatar isVerified stats.followersCount');
};

// Static method to get following
followSchema.statics.getFollowing = function(userId, limit = 20, skip = 0) {
  return this.find({
    follower: userId,
    status: 'accepted'
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('following', 'username displayName avatar isVerified stats.followersCount');
};

// Static method to get mutual follows
followSchema.statics.getMutualFollows = function(userId, otherUserId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { follower: userId, following: otherUserId },
          { follower: otherUserId, following: userId }
        ],
        status: 'accepted'
      }
    },
    {
      $group: {
        _id: null,
        follows: { $push: '$$ROOT' }
      }
    }
  ]);
};

module.exports = mongoose.model('Follow', followSchema);