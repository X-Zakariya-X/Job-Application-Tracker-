const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['applied', 'interview', 'offer', 'rejected']
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  jobUrl: {
    type: String,
    trim: true
  },
  currentStatus: {
    type: String,
    required: true,
    enum: ['applied', 'interview', 'offer', 'rejected'],
    default: 'applied'
  },
  statusHistory: [statusHistorySchema],
  resumeFile: {
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add status to history when status changes
jobSchema.pre('save', function(next) {
  if (this.isModified('currentStatus') && !this.isNew) {
    this.statusHistory.push({
      status: this.currentStatus,
      date: new Date()
    });
  } else if (this.isNew) {
    // For new jobs, add initial status to history
    this.statusHistory.push({
      status: this.currentStatus,
      date: this.applicationDate || new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);