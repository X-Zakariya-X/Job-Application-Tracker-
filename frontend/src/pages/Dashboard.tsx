import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Job, JobStats } from '../types';
import { jobService } from '../services/jobService';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, statsResponse] = await Promise.all([
        jobService.getJobs({ 
          status: statusFilter === 'all' ? undefined : statusFilter,
          sortBy: 'updatedAt',
          order: 'desc'
        }),
        jobService.getJobStats()
      ]);
      
      setJobs(jobsResponse.jobs);
      setStats(statsResponse);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      await jobService.updateJobStatus(jobId, newStatus);
      fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobService.deleteJob(jobId);
        fetchData(); // Refresh data
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete job');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title" style={{ 
          color: '#ffffff', 
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          fontSize: '3rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ✨ Job Tracker Dashboard
        </h1>
        <Link to="/add-job" className="btn btn-primary">
          <span>+</span> Add New Job
        </Link>
      </div>

      {error && <div className="error">❌ {error}</div>}

      {/* Modern Statistics Cards */}
      {stats && (
        <div className="grid grid-3" style={{ marginBottom: '32px' }}>
          <div className="stat-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            color: '#1f2937'
          }}>
            <div className="stat-label" style={{ color: '#6b7280', fontWeight: '600' }}>Total Applications</div>
            <div className="stat-number" style={{ color: '#1f2937', fontSize: '3rem', fontWeight: '800' }}>{stats.total}</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
              📊 All time
            </div>
          </div>
          <div className="stat-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            color: '#1f2937'
          }}>
            <div className="stat-label" style={{ color: '#6b7280', fontWeight: '600' }}>Active Pipeline</div>
            <div className="stat-number" style={{ color: '#1f2937', fontSize: '3rem', fontWeight: '800' }}>{stats.applied + stats.interview}</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
              🚀 In progress
            </div>
          </div>
          <div className="stat-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            color: '#1f2937'
          }}>
            <div className="stat-label" style={{ color: '#6b7280', fontWeight: '600' }}>Success Rate</div>
            <div className="stat-number" style={{ color: '#1f2937', fontSize: '3rem', fontWeight: '800' }}>
              {stats.total > 0 ? Math.round((stats.offer / stats.total) * 100) : 0}%
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
              🎯 Conversion
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Status breakdown */}
      {stats && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ color: '#1f2937', marginBottom: '24px' }}>
            📈 Application Pipeline
          </h3>
          <div className="grid grid-4">
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                {stats.applied}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Applied</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💼</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {stats.interview}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Interview</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46' }}>
                {stats.offer}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Offers</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>
                {stats.rejected}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Rejected</div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Filter Section */}
      <div className="filter-section">
        <h3 className="section-title">🔍 Filter Applications</h3>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ 
            maxWidth: '250px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <option value="all">🔥 All Applications</option>
          <option value="applied">📝 Applied</option>
          <option value="interview">💼 Interview</option>
          <option value="offer">🎉 Offer</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      </div>

      {/* Enhanced Job Cards */}
      <div className="grid grid-2">
        {jobs.length === 0 ? (
          <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚀</div>
            <h3>Ready to launch your career?</h3>
            <p style={{ marginBottom: '24px' }}>
              Start tracking your job applications and land your dream job!
            </p>
            <Link to="/add-job" className="btn btn-primary">
              <span>+</span> Add Your First Job
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <Link 
                    to={`/job/${job._id}`}
                    className="job-title"
                  >
                    {job.role}
                  </Link>
                  <div className="job-company">
                    🏢 {job.company}
                  </div>
                  <div className="job-meta">
                    {job.location && (
                      <div className="job-meta-item">
                        📍 {job.location}
                      </div>
                    )}
                    <div className="job-meta-item">
                      📅 Applied: {format(new Date(job.applicationDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="job-meta-item">
                      � Updated: {format(new Date(job.updatedAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <span className={`status-badge status-${job.currentStatus}`}>
                  {job.currentStatus === 'applied' && '📝'}
                  {job.currentStatus === 'interview' && '💼'}
                  {job.currentStatus === 'offer' && '🎉'}
                  {job.currentStatus === 'rejected' && '❌'}
                  {' '}
                  {job.currentStatus}
                </span>
              </div>

              {job.notes && (
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  marginBottom: '16px',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  padding: '12px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #667eea'
                }}>
                  💭 {job.notes}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                <select
                  value={job.currentStatus}
                  onChange={(e) => handleStatusUpdate(job._id, e.target.value)}
                  className="form-select"
                  style={{ 
                    fontSize: '12px', 
                    padding: '6px 12px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px'
                  }}
                >
                  <option value="applied">📝 Applied</option>
                  <option value="interview">💼 Interview</option>
                  <option value="offer">🎉 Offer</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              <div className="job-actions">
                <Link 
                  to={`/job/${job._id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  👁️ View
                </Link>
                <Link 
                  to={`/edit-job/${job._id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="btn btn-danger"
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
