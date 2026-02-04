import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { Job } from '../types';

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    description: '',
    location: '',
    salary: '',
    jobUrl: '',
    currentStatus: 'applied' as 'applied' | 'interview' | 'offer' | 'rejected',
    notes: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      fetchJob();
    }
  }, [isEdit, id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const job = await jobService.getJob(id!);
      setFormData({
        company: job.company,
        role: job.role,
        description: job.description || '',
        location: job.location || '',
        salary: job.salary || '',
        jobUrl: job.jobUrl || '',
        currentStatus: job.currentStatus,
        notes: job.notes || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append resume file if selected
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }

      if (isEdit && id) {
        await jobService.updateJob(id, formDataToSend);
        setSuccess('Job application updated successfully!');
      } else {
        await jobService.createJob(formDataToSend);
        setSuccess('Job application created successfully!');
      }

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job application');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="loading">Loading job details...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>{isEdit ? 'Edit Job Application' : 'Add New Job Application'}</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input
                type="text"
                name="company"
                className="form-input"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role/Position *</label>
              <input
                type="text"
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the role..."
              rows={4}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary</label>
              <input
                type="text"
                name="salary"
                className="form-input"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., $80,000 - $100,000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job URL</label>
            <input
              type="url"
              name="jobUrl"
              className="form-input"
              value={formData.jobUrl}
              onChange={handleInputChange}
              placeholder="https://company.com/jobs/123"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Status</label>
            <select
              name="currentStatus"
              className="form-select"
              value={formData.currentStatus}
              onChange={handleInputChange}
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Resume File</label>
            <input
              type="file"
              className="form-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Upload your resume (PDF, DOC, or DOCX - max 5MB)
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about this application..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Job' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
