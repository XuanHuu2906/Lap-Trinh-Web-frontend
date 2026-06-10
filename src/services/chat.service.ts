import { api } from "@/lib/api";

export type ChatConversation = {
  id: number;
  candidateProfileId: number;
  recruiterProfileId: number;
  jobPostingId?: number | null;
  createdAt: string;
  updatedAt: string;
  candidateProfile?: {
    fullName?: string | null;
    avatarUrl?: string | null;
  } | null;
  recruiterProfile?: {
    companyName?: string | null;
    logoUrl?: string | null;
    contactName?: string | null;
  } | null;
  jobPosting?: {
    title?: string | null;
  } | null;
  messages?: ChatMessage[];
  _count?: {
    messages: number;
  };
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  sentAt: string;
  sender?: {
    id: number;
    role: string;
  };
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const chatService = {
  async getConversations() {
    const response =
      await api.get<ApiResponse<ChatConversation[]>>("/chat/conversations");
    return response.data;
  },

  async getMessages(conversationId: number) {
    const response = await api.get<ApiResponse<ChatMessage[]>>(
      `/chat/conversations/${conversationId}/messages?limit=100`,
    );
    return response.data;
  },

  async sendMessage(conversationId: number, content: string) {
    const response = await api.post<ApiResponse<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages`,
      { content },
    );
    return response.data;
  },

  async markMessageRead(messageId: number) {
    const response = await api.put<ApiResponse<ChatMessage>>(
      `/chat/messages/${messageId}/read`,
    );
    return response.data;
  },
};
