export type ThemeMode = 'light' | 'dark';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiHealthResponse {
  success: boolean;
  message: string;
  version: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
}
