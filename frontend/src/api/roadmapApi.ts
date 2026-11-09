import { apiClient } from './axiosClient';
import {
  LearningRoadmap,
  RoadmapMilestone,
  GenerateRoadmapRequest,
  CreateCustomMilestoneRequest,
} from '../types/roadmap';

export const roadmapApi = {
  getRoadmaps: async (): Promise<{ success: boolean; data: { roadmaps: LearningRoadmap[] } }> => {
    const res = await apiClient.get<{ success: boolean; data: { roadmaps: LearningRoadmap[] } }>(
      '/roadmap'
    );
    return res.data;
  },

  getRoadmap: async (
    id: number
  ): Promise<{ success: boolean; data: { roadmap: LearningRoadmap } }> => {
    const res = await apiClient.get<{ success: boolean; data: { roadmap: LearningRoadmap } }>(
      `/roadmap/${id}`
    );
    return res.data;
  },

  generateRoadmap: async (
    data: GenerateRoadmapRequest
  ): Promise<{ success: boolean; message: string; data: { roadmap: LearningRoadmap } }> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { roadmap: LearningRoadmap };
    }>('/roadmap/generate', data);
    return res.data;
  },

  createRoadmap: async (
    data: Partial<LearningRoadmap>
  ): Promise<{ success: boolean; message: string; data: { roadmap: LearningRoadmap } }> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { roadmap: LearningRoadmap };
    }>('/roadmap', data);
    return res.data;
  },

  deleteRoadmap: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/roadmap/${id}`);
    return res.data;
  },

  toggleMilestone: async (
    roadmapId: number,
    milestoneId: number,
    isCompleted: boolean
  ): Promise<{
    success: boolean;
    message: string;
    data: { milestone: RoadmapMilestone; roadmap_completion_pct: number };
  }> => {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { milestone: RoadmapMilestone; roadmap_completion_pct: number };
    }>(`/roadmap/${roadmapId}/milestones/${milestoneId}`, { is_completed: isCompleted });
    return res.data;
  },

  addCustomMilestone: async (
    roadmapId: number,
    data: CreateCustomMilestoneRequest
  ): Promise<{ success: boolean; message: string; data: { milestone: RoadmapMilestone } }> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { milestone: RoadmapMilestone };
    }>(`/roadmap/${roadmapId}/milestones`, data);
    return res.data;
  },
};
