const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  
  // Profile Information
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/fins-app/image/upload/v1/default-avatar.png'
  },
  coverImage: {
    type: String,
    default: null
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  
  // Social Links
  socialLinks: {
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    youtube: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    facebook: { type: String, trim: true }
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accountType: {
    type: String,
    enum: ['personal', 'creator', 'business'],
    default: 'personal'
  },
  
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      allowDirectMessages: { type: Boolean, default: true },
      allowTagging: { type: Boolean, default: true },
      allowComments: { type: Boolean, default: true }
    }
  },
  
  // Interests and Categories
  interests: [{
    type: String,
    enum: [
      'gaming', 'music', 'sports', 'comedy', 'education', 'tech', 'food', 
      'travel', 'fashion', 'beauty', 'fitness', 'dance', 'art', 'diy', 
      'pets', 'lifestyle', 'news', 'entertainment', 'automotive', 'nature'
    ]
  }],
  
  // Statistics
  stats: {
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    videosCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 }
  },
  
  // Authentication
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  
  // Two-Factor Authentication
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  // Device and Session Management
  devices: [{
    deviceId: String,
    deviceName: String,
    deviceType: String,
    lastActive: Date,
    pushToken: String,
    location: {
      country: String,
      city: String,
      ip: String
    }
  }],
  
  // Monetization
  monetization: {
    isEligible: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    payoutMethods: [{
      type: String,
      details: Object
    }]
  },
  
  // Subscription and Premium
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'creator', 'business'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false },
    paymentMethod: String
  },
  
  // Moderation
  strikes: {
    type: Number,
    default: 0
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  banExpiresAt: Date,
  
  // Timestamps
  lastLogin: Date,
  lastActive: Date,
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
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'stats.followersCount': -1 });
userSchema.index({ 'stats.videosCount': -1 });
userSchema.index({ interests: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isPublic: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `${process.env.FRONTEND_URL}/profile/${this.username}`;
});

// Virtual for follower ratio
userSchema.virtual('followerRatio').get(function() {
  if (this.stats.followingCount === 0) return this.stats.followersCount;
  return (this.stats.followersCount / this.stats.followingCount).toFixed(2);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to set passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    username: this.username,
    email: this.email,
    isVerified: this.isVerified,
    accountType: this.accountType
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

// Instance method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Instance method to add device
userSchema.methods.addDevice = function(deviceInfo) {
  // Remove existing device with same deviceId
  this.devices = this.devices.filter(device => device.deviceId !== deviceInfo.deviceId);
  
  // Add new device
  this.devices.push({
    ...deviceInfo,
    lastActive: Date.now()
  });
  
  // Keep only last 10 devices
  if (this.devices.length > 10) {
    this.devices = this.devices.slice(-10);
  }
  
  return this.save({ validateBeforeSave: false });
};

// Instance method to remove device
userSchema.methods.removeDevice = function(deviceId) {
  this.devices = this.devices.filter(device => device.deviceId !== deviceId);
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment stats
userSchema.methods.incrementStat = function(statName, value = 1) {
  this.stats[statName] = (this.stats[statName] || 0) + value;
  return this.save({ validateBeforeSave: false });
};

// Instance method to decrement stats
userSchema.methods.decrementStat = function(statName, value = 1) {
  this.stats[statName] = Math.max(0, (this.stats[statName] || 0) - value);
  return this.save({ validateBeforeSave: false });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function(limit = 10) {
  return this.find({ isActive: true, isBanned: false })
    .sort({ lastActive: -1 })
    .limit(limit);
};

// Static method to find trending users
userSchema.statics.findTrendingUsers = function(limit = 10) {
  return this.find({ isActive: true, isBanned: false })
    .sort({ 'stats.followersCount': -1, 'stats.likesCount': -1 })
    .limit(limit);
};

// Static method to find users by interests
userSchema.statics.findByInterests = function(interests, limit = 10) {
  return this.find({ 
    interests: { $in: interests },
    isActive: true,
    isBanned: false,
    isPublic: true
  })
  .sort({ 'stats.followersCount': -1 })
  .limit(limit);
};

module.exports = mongoose.model('User', userSchema);