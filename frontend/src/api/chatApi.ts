import { apiClient } from './axiosClient';
import { Persona, Conversation, ChatMessage } from '../types/chat';

export const chatApi = {
  getPersonas: async (): Promise<{ success: boolean; personas: Persona[] }> => {
    const res = await apiClient.get<{ success: boolean; personas: Persona[] }>('/chat/personas');
    return res.data;
  },

  getConversations: async (): Promise<{ success: boolean; conversations: Conversation[]; count: number }> => {
    const res = await apiClient.get<{ success: boolean; conversations: Conversation[]; count: number }>(
      '/chat/conversations'
    );
    return res.data;
  },

  createConversation: async (data: {
    persona_mode: string;
    title?: string;
    provider?: string;
  }): Promise<{ success: boolean; conversation: Conversation }> => {
    const res = await apiClient.post<{ success: boolean; conversation: Conversation }>(
      '/chat/conversations',
      data
    );
    return res.data;
  },

  getConversationDetails: async (
    id: number
  ): Promise<{ success: boolean; conversation: Conversation }> => {
    const res = await apiClient.get<{ success: boolean; conversation: Conversation }>(
      `/chat/conversations/${id}`
    );
    return res.data;
  },

  deleteConversation: async (id: number): Promise<{ success: boolean; conversation_id: number }> => {
    const res = await apiClient.delete<{ success: boolean; conversation_id: number }>(
      `/chat/conversations/${id}`
    );
    return res.data;
  },

  sendMessage: async (
    convId: number,
    content: string
  ): Promise<{
    success: boolean;
    user_message: ChatMessage;
    assistant_message: ChatMessage;
    conversation: Conversation;
  }> => {
    const res = await apiClient.post<{
      success: boolean;
      user_message: ChatMessage;
      assistant_message: ChatMessage;
      conversation: Conversation;
    }>(`/chat/conversations/${convId}/messages`, { content });
    return res.data;
  },

  regenerateResponse: async (
    convId: number
  ): Promise<{
    success: boolean;
    assistant_message: ChatMessage;
  }> => {
    const res = await apiClient.post<{
      success: boolean;
      assistant_message: ChatMessage;
    }>(`/chat/conversations/${convId}/regenerate`);
    return res.data;
  },
};
