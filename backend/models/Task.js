const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'planning', 'approved', 'in_progress', 'completed', 'failed'],
    default: 'pending',
  },
  plan: [{
    step: Number,
    description: String,
    files: [String],
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    }
  }],
  generatedCode: [{
    filePath: String,
    content: String,
    language: String,
  }],
  commits: [{
    sha: String,
    message: String,
    timestamp: Date,
  }],
  errorMessage: {
    type: String,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
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

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
