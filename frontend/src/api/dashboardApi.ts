import { apiClient } from './axiosClient';
import { DashboardData } from '../types/dashboard';

export const dashboardApi = {
  getDashboardMetrics: async (): Promise<DashboardData> => {
    const res = await apiClient.get<DashboardData>('/dashboard/metrics');
    return res.data;
  },

  seedSampleData: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/dashboard/seed-sample');
    return res.data;
  },
};
