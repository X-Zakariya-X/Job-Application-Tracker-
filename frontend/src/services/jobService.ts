import api from './api';
import { Job, JobStats } from '../types';

export const jobService = {
  async getJobs(filters?: { status?: string; sortBy?: string; order?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  async getJob(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  async createJob(jobData: FormData): Promise<Job> {
    const response = await api.post('/jobs', jobData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.job;
  },

  async updateJob(id: string, jobData: FormData): Promise<Job> {
    const response = await api.put(`/jobs/${id}`, jobData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.job;
  },

  async updateJobStatus(id: string, status: string, notes?: string) {
    const response = await api.patch(`/jobs/${id}/status`, { status, notes });
    return response.data;
  },

  async deleteJob(id: string) {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  async getJobStats(): Promise<JobStats> {
    const response = await api.get('/jobs/stats');
    return response.data;
  },

  async downloadResume(id: string) {
    const response = await api.get(`/jobs/${id}/resume`, {
      responseType: 'blob',
    });
    return response.data;
  }
};
