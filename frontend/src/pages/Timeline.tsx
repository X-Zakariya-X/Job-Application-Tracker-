import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { jobService } from '../services/jobService';
import { format } from 'date-fns';

const Timeline: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobs({
        sortBy: 'updatedAt',
        order: 'desc'
      });
      setJobs(response.jobs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  // Create timeline events from all job status history
  const createTimelineEvents = () => {
    const events: Array<{
      id: string;
      jobId: string;
      company: string;
      role: string;
      status: string;
      date: string;
      notes?: string;
    }> = [];

    jobs.forEach(job => {
      job.statusHistory.forEach(historyItem => {
        events.push({
          id: `${job._id}-${historyItem._id}`,
          jobId: job._id,
          company: job.company,
          role: job.role,
          status: historyItem.status,
          date: historyItem.date,
          notes: historyItem.notes
        });
      });
    });

    // Sort by date (most recent first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = createTimelineEvents();

  const groupEventsByDate = () => {
    const grouped: { [key: string]: typeof timelineEvents } = {};
    
    timelineEvents.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const groupedEvents = groupEventsByDate();

  if (loading) {
    return <div className="loading">Loading timeline...</div>;
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="card">
        <h2>Timeline</h2>
        <p>No job application activity found. Start by adding your first job application!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Application Timeline</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Track the progress of all your job applications over time
      </p>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="timeline">
          {Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date} style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                color: '#374151',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
              </h3>
              
              {events.map(event => (
                <div key={event.id} className="timeline-item" style={{ marginLeft: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>{event.role}</strong> at <strong>{event.company}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`status-badge status-${event.status}`}>
                          {event.status}
                        </span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {format(new Date(event.date), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {event.notes && (
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      fontStyle: 'italic',
                      marginTop: '0.5rem',
                      backgroundColor: '#f9fafb',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}>
                      {event.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Timeline Summary</h3>
        <div className="grid grid-2">
          <div>
            <strong>Total Events:</strong> {timelineEvents.length}
          </div>
          <div>
            <strong>Active Applications:</strong>{' '}
            {jobs.filter(job => 
              job.currentStatus === 'applied' || job.currentStatus === 'interview'
            ).length}
          </div>
          <div>
            <strong>Recent Activity:</strong>{' '}
            {timelineEvents.filter(event => 
              new Date(event.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length} events this week
          </div>
          <div>
            <strong>Success Rate:</strong>{' '}
            {jobs.length > 0 
              ? Math.round((jobs.filter(job => job.currentStatus === 'offer').length / jobs.length) * 100)
              : 0
            }%
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Status Distribution</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['applied', 'interview', 'offer', 'rejected'].map(status => {
            const count = jobs.filter(job => job.currentStatus === status).length;
            return (
              <div key={status} style={{ textAlign: 'center' }}>
                <div className={`status-badge status-${status}`} style={{ 
                  display: 'block',
                  fontSize: '2rem',
                  padding: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  {count}
                </div>
                <div style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                  {status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
