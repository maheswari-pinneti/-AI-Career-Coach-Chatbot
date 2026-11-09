export type PersonaMode =
  | 'career_mentor'
  | 'technical_mentor'
  | 'resume_coach'
  | 'interview_coach'
  | 'learning_mentor'
  | 'career_switch';

export interface Persona {
  id: PersonaMode;
  name: string;
  title: string;
  description: string;
  starter_prompts: string[];
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string | null;
  model?: string | null;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  latency_ms?: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  persona_mode: PersonaMode;
  provider: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  messages?: ChatMessage[];
}
