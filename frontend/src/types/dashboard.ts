export interface DashboardMetrics {
  readiness_score: number;
  resume_score: number;
  linkedin_score: number;
  interview_score: number;
  skills_score: number;
  roadmap_score: number;
  job_applications_count: number;
  interviews_count?: number;
  offers_count?: number;
  interview_conversion_rate: number;
}

export interface ProgressChartPoint {
  month: string;
  readiness: number;
  interview: number;
  skills: number;
}

export interface ActivityItem {
  id: number;
  user_id: number;
  activity_type: string;
  title: string;
  description?: string | null;
  score_impact: number;
  created_at: string;
}

export interface TimelineItem {
  id: number;
  type: string;
  title: string;
  description?: string | null;
  score_impact: string;
  timestamp: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  link: string;
  category: string;
}

export interface DashboardData {
  success: boolean;
  has_data: boolean;
  metrics: DashboardMetrics;
  recent_activities: ActivityItem[];
  timeline: TimelineItem[];
  progress_chart: ProgressChartPoint[];
  recommended_actions: RecommendedAction[];
  message?: string;
}
