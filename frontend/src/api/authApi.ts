import { apiClient } from './axiosClient';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ResetPasswordData,
  User,
  UserProfile,
  UserPreference,
  UserSessionItem,
} from '../types/auth';

export const authApi = {
  // Authentication endpoints
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/auth/logout');
    return res.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },

  forgotPassword: async (
    email: string
  ): Promise<{ success: boolean; message: string; reset_token?: string }> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      reset_token?: string;
    }>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (
    data: ResetPasswordData
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      data
    );
    return res.data;
  },

  changePassword: async (
    data: ChangePasswordData
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/change-password',
      data
    );
    return res.data;
  },

  // Profile endpoints
  getProfile: async (): Promise<{
    success: boolean;
    user: User;
    profile: UserProfile;
    preferences?: UserPreference;
  }> => {
    const res = await apiClient.get<{
      success: boolean;
      user: User;
      profile: UserProfile;
      preferences?: UserPreference;
    }>('/profile');
    return res.data;
  },

  updateProfile: async (
    data: Partial<UserProfile> & { first_name?: string; last_name?: string }
  ): Promise<{
    success: boolean;
    message: string;
    user: User;
    profile: UserProfile;
  }> => {
    const res = await apiClient.put<{
      success: boolean;
      message: string;
      user: User;
      profile: UserProfile;
    }>('/profile', data);
    return res.data;
  },

  // Preferences endpoints
  getPreferences: async (): Promise<{ success: boolean; preferences: UserPreference }> => {
    const res = await apiClient.get<{ success: boolean; preferences: UserPreference }>(
      '/profile/preferences'
    );
    return res.data;
  },

  updatePreferences: async (
    data: Partial<UserPreference>
  ): Promise<{ success: boolean; message: string; preferences: UserPreference }> => {
    const res = await apiClient.put<{
      success: boolean;
      message: string;
      preferences: UserPreference;
    }>('/profile/preferences', data);
    return res.data;
  },

  // Sessions endpoints
  getSessions: async (): Promise<{
    success: boolean;
    sessions: UserSessionItem[];
    count: number;
  }> => {
    const res = await apiClient.get<{
      success: boolean;
      sessions: UserSessionItem[];
      count: number;
    }>('/sessions');
    return res.data;
  },

  revokeSession: async (
    sessionId: string
  ): Promise<{ success: boolean; message: string; session_id: string }> => {
    const res = await apiClient.delete<{
      success: boolean;
      message: string;
      session_id: string;
    }>(`/sessions/${sessionId}`);
    return res.data;
  },
};
