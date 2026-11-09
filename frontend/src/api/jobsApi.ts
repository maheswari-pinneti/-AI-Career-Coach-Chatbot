import { apiClient } from './axiosClient';
import {
  JobApplication,
  JobKanbanResponse,
  JobListResponse,
  CreateJobRequest,
  UpdateJobStatusRequest,
  JobStatus,
} from '../types/job';

export const jobsApi = {
  getJobs: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: JobListResponse }> => {
    const res = await apiClient.get<{ success: boolean; data: JobListResponse }>('/jobs', {
      params,
    });
    return res.data;
  },

  getKanban: async (): Promise<{ success: boolean; data: JobKanbanResponse }> => {
    const res = await apiClient.get<{ success: boolean; data: JobKanbanResponse }>('/jobs/kanban');
    return res.data;
  },

  getJob: async (id: number): Promise<{ success: boolean; data: { job: JobApplication } }> => {
    const res = await apiClient.get<{ success: boolean; data: { job: JobApplication } }>(
      `/jobs/${id}`
    );
    return res.data;
  },

  createJob: async (
    data: CreateJobRequest
  ): Promise<{ success: boolean; message: string; data: { job: JobApplication } }> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { job: JobApplication };
    }>('/jobs', data);
    return res.data;
  },

  updateJob: async (
    id: number,
    data: Partial<CreateJobRequest>
  ): Promise<{ success: boolean; message: string; data: { job: JobApplication } }> => {
    const res = await apiClient.put<{
      success: boolean;
      message: string;
      data: { job: JobApplication };
    }>(`/jobs/${id}`, data);
    return res.data;
  },

  updateStatus: async (
    id: number,
    status: JobStatus,
    notes?: string
  ): Promise<{ success: boolean; message: string; data: { job: JobApplication } }> => {
    const payload: UpdateJobStatusRequest = { status, notes };
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { job: JobApplication };
    }>(`/jobs/${id}/status`, payload);
    return res.data;
  },

  deleteJob: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/jobs/${id}`);
    return res.data;
  },
};
