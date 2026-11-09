export type JobStatus =
  | 'interested'
  | 'applied'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface JobStatusHistoryItem {
  id: number;
  job_id: number;
  previous_status: string;
  new_status: string;
  notes?: string;
  created_at: string;
}

export interface JobApplication {
  id: number;
  user_id: number;
  company: string;
  job_title: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  application_date?: string;
  interview_date?: string;
  follow_up_date?: string;
  status: JobStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  status_history?: JobStatusHistoryItem[];
}

export interface JobKanbanResponse {
  columns: Record<JobStatus, JobApplication[]>;
  total: number;
}

export interface JobListResponse {
  items: JobApplication[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface CreateJobRequest {
  company: string;
  job_title: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  application_date?: string;
  interview_date?: string;
  follow_up_date?: string;
  status?: JobStatus;
  notes?: string;
}

export interface UpdateJobStatusRequest {
  status: JobStatus;
  notes?: string;
}
