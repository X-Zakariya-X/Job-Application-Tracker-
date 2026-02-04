const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Get all jobs for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let query = { userId: req.user.userId };
    
    if (status && status !== 'all') {
      query.currentStatus = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder })
      .populate('userId', 'username email');

    res.json({
      jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get job statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await Job.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalJobs = await Job.countDocuments({ userId });
    
    const formattedStats = {
      total: totalJobs,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Get single job by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('userId', 'username email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

// Create new job application
router.post('/', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const {
      company,
      role,
      description,
      location,
      salary,
      jobUrl,
      currentStatus = 'applied',
      notes
    } = req.body;

    const jobData = {
      userId: req.user.userId,
      company,
      role,
      description,
      location,
      salary,
      jobUrl,
      currentStatus,
      notes
    };

    // Add resume file info if uploaded
    if (req.file) {
      jobData.resumeFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job application created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error creating job application' });
  }
});

// Update job application
router.put('/:id', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const {
      company,
      role,
      description,
      location,
      salary,
      jobUrl,
      currentStatus,
      notes
    } = req.body;

    // Update basic fields
    if (company) job.company = company;
    if (role) job.role = role;
    if (description) job.description = description;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (jobUrl) job.jobUrl = jobUrl;
    if (notes) job.notes = notes;

    // Update status (this will trigger the pre-save middleware to add to history)
    if (currentStatus && currentStatus !== job.currentStatus) {
      job.currentStatus = currentStatus;
    }

    // Handle resume file upload
    if (req.file) {
      // Delete old resume file if exists
      if (job.resumeFile && job.resumeFile.path) {
        try {
          fs.unlinkSync(job.resumeFile.path);
        } catch (err) {
          console.error('Error deleting old resume file:', err);
        }
      }

      job.resumeFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    await job.save();

    res.json({
      message: 'Job application updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error updating job application' });
  }
});

// Update job status only
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['applied', 'interview', 'offer', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.currentStatus = status;
    if (notes) {
      job.statusHistory[job.statusHistory.length - 1].notes = notes;
    }

    await job.save();

    res.json({
      message: 'Job status updated successfully',
      job
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating job status' });
  }
});

// Delete job application
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Delete resume file if exists
    if (job.resumeFile && job.resumeFile.path) {
      try {
        fs.unlinkSync(job.resumeFile.path);
      } catch (err) {
        console.error('Error deleting resume file:', err);
      }
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error deleting job application' });
  }
});

// Download resume file
router.get('/:id/resume', verifyToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!job || !job.resumeFile) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    const filePath = job.resumeFile.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    res.download(filePath, job.resumeFile.originalName);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ message: 'Server error downloading resume' });
  }
});

module.exports = router;
