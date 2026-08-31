const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  githubId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  htmlUrl: {
    type: String,
    required: true,
  },
  cloneUrl: {
    type: String,
    required: true,
  },
  defaultBranch: {
    type: String,
    default: 'main',
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  lastSyncedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

repositorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Repository', repositorySchema);
