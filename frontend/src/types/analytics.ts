export interface ScoreProgressionPoint {
  date: string;
  readiness_score: number;
  resume_score: number;
  interview_score: number;
}

export interface ActivityTimelineItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  date: string;
}

export interface AnalyticsOverview {
  job_metrics: {
    total_applications: number;
    interview_conversion_rate: number;
    offer_conversion_rate: number;
    active_applications: number;
    status_distribution: Record<string, number>;
  };
  roadmap_metrics: {
    total_roadmaps: number;
    active_roadmaps: number;
    average_completion_pct: number;
    total_milestones: number;
    completed_milestones: number;
  };
  skill_metrics: {
    total_profile_skills: number;
    profile_skills: string[];
    target_role?: string;
  };
  score_progression: ScoreProgressionPoint[];
  recent_timeline: ActivityTimelineItem[];
  generated_at?: string;
  period_days?: number;
}
