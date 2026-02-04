import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Job } from '../types';
import { jobService } from '../services/jobService';
import { format } from 'date-fns';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJob(id!);
      setJob(jobData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!job) return;
    
    try {
      await jobService.updateJobStatus(job._id, newStatus);
      await fetchJob(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobService.deleteJob(job._id);
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete job');
      }
    }
  };

  const downloadResume = async () => {
    if (!job || !job.resumeFile) return;
    
    try {
      const blob = await jobService.downloadResume(job._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = job.resumeFile.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download resume');
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="card">
        <h2>Job Not Found</h2>
        <p>The job application you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {error && <div className="error">{error}</div>}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1>{job.role}</h1>
          <p style={{ fontSize: '1.2rem', color: '#6b7280', margin: '0.5rem 0' }}>
            {job.company}
          </p>
          {job.location && (
            <p style={{ color: '#9ca3af' }}>📍 {job.location}</p>
          )}
        </div>
        <span className={`status-badge status-${job.currentStatus}`} style={{ fontSize: '1rem' }}>
          {job.currentStatus}
        </span>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3>Job Information</h3>
          
          {job.salary && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Salary:</strong> {job.salary}
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Application Date:</strong>{' '}
            {format(new Date(job.applicationDate), 'MMMM dd, yyyy')}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Last Updated:</strong>{' '}
            {format(new Date(job.updatedAt), 'MMMM dd, yyyy')}
          </div>
          
          {job.jobUrl && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Job Posting:</strong>{' '}
              <a 
                href={job.jobUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#3b82f6' }}
              >
                View Original Posting
              </a>
            </div>
          )}

          {job.resumeFile && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Resume:</strong>{' '}
              <button 
                onClick={downloadResume}
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Download {job.resumeFile.originalName}
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Update Status:</label>
            <select
              value={job.currentStatus}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="form-select"
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link 
              to={`/edit-job/${job._id}`}
              className="btn btn-primary"
            >
              Edit Details
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Delete Job
            </button>
          </div>
        </div>
      </div>

      {job.description && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Job Description</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {job.description}
          </p>
        </div>
      )}

      {job.notes && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Notes</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {job.notes}
          </p>
        </div>
      )}

      <div className="card">
        <h3>Status History</h3>
        <div className="timeline">
          {job.statusHistory.map((historyItem, index) => (
            <div key={historyItem._id} className="timeline-item">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span className={`status-badge status-${historyItem.status}`}>
                  {historyItem.status}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {format(new Date(historyItem.date), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              {historyItem.notes && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  {historyItem.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default JobDetail;
