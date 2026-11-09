export interface LearningResource {
  id: number;
  milestone_id: number;
  title: string;
  description?: string;
  category: string;
  url: string;
  resource_type: string;
  difficulty?: string;
  estimated_duration?: string;
  is_verified: boolean;
  created_at: string;
}

export interface RoadmapMilestone {
  id: number;
  roadmap_id: number;
  title: string;
  description?: string;
  order_index: number;
  weekly_tasks: string[];
  estimated_duration?: string;
  priority: string;
  is_completed: boolean;
  completed_at?: string | null;
  resources: LearningResource[];
  created_at: string;
}

export interface LearningRoadmap {
  id: number;
  user_id: number;
  title: string;
  target_role: string;
  current_skills: string[];
  skill_gaps: string[];
  weekly_hours: number;
  learning_objectives: string[];
  completion_pct: number;
  status: string;
  milestones: RoadmapMilestone[];
  created_at: string;
  updated_at: string;
}

export interface GenerateRoadmapRequest {
  target_role: string;
  current_skills: string[];
  skill_gaps: string[];
  weekly_hours?: number;
  learning_objectives?: string[];
}

export interface CreateCustomMilestoneRequest {
  title: string;
  description?: string;
  order_index?: number;
  weekly_tasks?: string[];
  estimated_duration?: string;
  priority?: string;
}
