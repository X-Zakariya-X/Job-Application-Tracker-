const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Job = require('../models/Job');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'job-tracker-resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // needed for non-image files (pdf, doc)
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs — Get all jobs for the authenticated user (with optional filter)
// ─────────────────────────────────────────────────────────────────────────────
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

    res.json({ jobs, count: jobs.length });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs/stats — Aggregated stats per status
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Job.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    ]);

    const totalJobs = await Job.countDocuments({ userId });

    const formattedStats = { total: totalJobs, applied: 0, interview: 0, offer: 0, rejected: 0 };
    stats.forEach(stat => { formattedStats[stat._id] = stat.count; });

    res.json(formattedStats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs/:id — Single job
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate('userId', 'username email');

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/jobs — Create new job application
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const { company, role, description, location, salary, jobUrl, currentStatus = 'applied', notes } = req.body;

    const jobData = {
      userId: req.user.userId,
      company, role, description, location, salary, jobUrl, currentStatus, notes,
    };

    // Save Cloudinary file info if a resume was uploaded
    if (req.file) {
      jobData.resumeFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,          // Cloudinary URL
        cloudinaryPublicId: req.file.filename, // used later for deletion
      };
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({ message: 'Job application created successfully', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error creating job application' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/jobs/:id — Update job application
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const { company, role, description, location, salary, jobUrl, currentStatus, notes } = req.body;

    if (company)      job.company = company;
    if (role)         job.role = role;
    if (description)  job.description = description;
    if (location)     job.location = location;
    if (salary)       job.salary = salary;
    if (jobUrl)       job.jobUrl = jobUrl;
    if (notes)        job.notes = notes;

    if (currentStatus && currentStatus !== job.currentStatus) {
      job.currentStatus = currentStatus;
    }

    // Handle new resume — delete old one from Cloudinary first
    if (req.file) {
      if (job.resumeFile && job.resumeFile.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(job.resumeFile.cloudinaryPublicId, { resource_type: 'raw' });
        } catch (err) {
          console.error('Error deleting old Cloudinary file:', err);
        }
      }
      job.resumeFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        cloudinaryPublicId: req.file.filename,
      };
    }

    await job.save();
    res.json({ message: 'Job application updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error updating job application' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/jobs/:id/status — Quick status update only
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['applied', 'interview', 'offer', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.currentStatus = status;
    if (notes) {
      job.statusHistory[job.statusHistory.length - 1].notes = notes;
    }

    await job.save();
    res.json({ message: 'Job status updated successfully', job });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating job status' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/jobs/:id — Delete job + cleanup Cloudinary file
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Delete resume from Cloudinary if it exists
    if (job.resumeFile && job.resumeFile.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(job.resumeFile.cloudinaryPublicId, { resource_type: 'raw' });
      } catch (err) {
        console.error('Error deleting Cloudinary file:', err);
      }
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error deleting job application' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs/:id/resume — Return Cloudinary URL for direct download
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/resume', verifyToken, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!job || !job.resumeFile) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    // Return the Cloudinary URL — frontend can redirect to it
    res.json({ url: job.resumeFile.path, originalName: job.resumeFile.originalName });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error fetching resume' });
  }
});

module.exports = router;
