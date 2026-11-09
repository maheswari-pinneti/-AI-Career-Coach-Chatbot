export interface UserProfile {
  id?: number;
  user_id?: number;
  profile_image?: string | null;
  current_designation?: string | null;
  current_company?: string | null;
  total_experience?: number;
  current_skills?: string[];
  target_role?: string | null;
  career_objectives?: string | null;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    year?: number;
  }>;
  location?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreference {
  id?: number;
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  ai_provider: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  profile?: UserProfile;
  preferences?: UserPreference;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  target_role?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

export interface UserSessionItem {
  id: number;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  last_active?: string;
  is_revoked: boolean;
  created_at?: string;
}
