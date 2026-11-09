import { apiClient } from './axiosClient';
import { AnalyticsOverview } from '../types/analytics';

export const analyticsApi = {
  getOverview: async (
    days = 30
  ): Promise<{ success: boolean; data: AnalyticsOverview }> => {
    const res = await apiClient.get<{ success: boolean; data: AnalyticsOverview }>(
      '/analytics/overview',
      { params: { days } }
    );
    return res.data;
  },

  exportAnalytics: async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const res = await apiClient.get('/analytics/export', {
      params: { format },
      responseType: 'blob',
    });
    return res.data;
  },
};
