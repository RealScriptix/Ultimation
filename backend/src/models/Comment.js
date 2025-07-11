const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Basic Information
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  
  // Video Reference
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Video reference is required']
  },
  
  // Nested Comments (Replies)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  // Mentions
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    startIndex: Number,
    endIndex: Number
  }],
  
  // Engagement Statistics
  stats: {
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    reportsCount: { type: Number, default: 0 }
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
    moderatedAt: Date
  },
  
  // Comment Type
  type: {
    type: String,
    enum: ['comment', 'reply', 'mention'],
    default: 'comment'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: -1 });
commentSchema.index({ 'stats.likesCount': -1 });
commentSchema.index({ 'moderation.isApproved': 1 });
commentSchema.index({ isDeleted: 1 });

// Virtual for comment depth
commentSchema.virtual('depth').get(function() {
  return this.parentComment ? 1 : 0;
});

// Virtual for formatted content with mentions
commentSchema.virtual('formattedContent').get(function() {
  let content = this.content;
  
  // Replace mentions with clickable links
  if (this.mentions && this.mentions.length > 0) {
    let offset = 0;
    this.mentions.forEach(mention => {
      const beforeMention = content.slice(0, mention.startIndex + offset);
      const afterMention = content.slice(mention.endIndex + offset);
      const mentionText = `@${mention.username}`;
      content = beforeMention + mentionText + afterMention;
      offset += mentionText.length - (mention.endIndex - mention.startIndex);
    });
  }
  
  return content;
});

// Pre-save middleware to extract mentions
commentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push({
        username: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
    
    this.mentions = mentions;
  }
  
  next();
});

// Instance method to increment likes
commentSchema.methods.incrementLikes = function() {
  this.stats.likesCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to decrement likes
commentSchema.methods.decrementLikes = function() {
  this.stats.likesCount = Math.max(0, this.stats.likesCount - 1);
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment replies
commentSchema.methods.incrementReplies = function() {
  this.stats.repliesCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to decrement replies
commentSchema.methods.decrementReplies = function() {
  this.stats.repliesCount = Math.max(0, this.stats.repliesCount - 1);
  return this.save({ validateBeforeSave: false });
};

// Instance method to soft delete
commentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Instance method to restore
commentSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return this.save({ validateBeforeSave: false });
};

// Static method to find comments by video
commentSchema.statics.findByVideo = function(videoId, limit = 20, skip = 0) {
  return this.find({
    video: videoId,
    parentComment: null,
    isDeleted: false,
    'moderation.isApproved': true
  })
  .sort({ 'stats.likesCount': -1, createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'username displayName avatar isVerified')
  .populate({
    path: 'replies',
    match: { isDeleted: false, 'moderation.isApproved': true },
    populate: {
      path: 'author',
      select: 'username displayName avatar isVerified'
    },
    options: { sort: { createdAt: 1 }, limit: 3 }
  });
};

// Static method to find replies
commentSchema.statics.findReplies = function(commentId, limit = 20, skip = 0) {
  return this.find({
    parentComment: commentId,
    isDeleted: false,
    'moderation.isApproved': true
  })
  .sort({ createdAt: 1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'username displayName avatar isVerified');
};

// Static method to find comments by user
commentSchema.statics.findByUser = function(userId, limit = 20, skip = 0) {
  return this.find({
    author: userId,
    isDeleted: false,
    'moderation.isApproved': true
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('video', 'title thumbnailUrl creator')
  .populate('author', 'username displayName avatar isVerified');
};

module.exports = mongoose.model('Comment', commentSchema);