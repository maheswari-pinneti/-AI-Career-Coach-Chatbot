export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'job' | 'roadmap' | 'interview' | 'resume' | 'system' | string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  id?: number;
  user_id?: number;
  email_notifications: boolean;
  in_app_notifications: boolean;
  job_alerts: boolean;
  milestone_reminders: boolean;
  weekly_digest: boolean;
}
