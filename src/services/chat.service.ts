/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  chat.service.ts — Service xử lý các API call liên quan đến Chat
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Các endpoints:
 *  GET    /chat/conversations              → danh sách hội thoại
 *  POST   /chat/conversations              → tạo hội thoại mới
 *  GET    /chat/conversations/unread-count → tổng số tin chưa đọc
 *  GET    /chat/conversations/:id/messages → tin nhắn của hội thoại
 *  POST   /chat/conversations/:id/messages → gửi tin nhắn văn bản
 *  POST   /chat/conversations/:id/attachments → gửi file đính kèm
 *  PUT    /chat/messages/:id/read          → đánh dấu đã đọc
 *  GET    /chat/conversations/:id/applications → danh sách application (recruiter)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { get, post, put } from './api-client';
import type { RecruiterApplication } from './recruiter.service';

/**
 * Cấu trúc một tin nhắn trong hệ thống chat
 * - messageType: "text" (văn bản) hoặc "file" (có đính kèm)
 * - attachmentUrl: Signed URL từ backend (có thời hạn 10 phút) để xem/tải file
 * - isRead: true nếu người nhận đã đọc
 * - sentAt: ISO string thời gian gửi
 * - sender: thông tin người gửi (id + role)
 */
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string | null;
  messageType: 'text' | 'file';
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentMime: string | null;
  attachmentSize: number | null;
  attachmentUrl?: string;
  isRead: boolean;
  sentAt: string;
  sender: {
    id: number;
    role: 'candidate' | 'recruiter' | 'admin';
  };
}

/**
 * Cấu trúc một cuộc hội thoại
 * - candidateProfile: thông tin ứng viên (fullName, avatar)
 * - recruiterProfile: thông tin nhà tuyển dụng (companyName, contactName, logo)
 * - jobPosting: tin tuyển dụng liên quan
 * - application: (chỉ recruiter) thông tin ứng tuyển gắn với conversation
 * - messages: tin nhắn gần nhất (dùng để hiển thị preview trong sidebar)
 * - _count.messages: số tin nhắn chưa đọc (dành cho user hiện tại)
 */
export interface Conversation {
  id: number;
  candidateProfileId: number;
  recruiterProfileId: number;
  jobPostingId: number | null;
  createdAt: string;
  updatedAt: string;
  candidateProfile: {
    fullName: string;
    avatarUrl: string | null;
  };
  recruiterProfile: {
    companyName: string;
    logoUrl: string | null;
    contactName: string | null;
  };
  jobPosting: {
    title: string;
  } | null;
  application?: RecruiterApplication | null;
  messages: Message[];
  _count?: {
    messages: number;
  };
}

/**
 * Payload để tạo hội thoại mới (chỉ candidate)
 * - recruiterProfileId: ID hồ sơ nhà tuyển dụng muốn chat
 * - jobPostingId: ID tin tuyển dụng liên quan
 */
export interface CreateConversationPayload {
  recruiterProfileId: number;
  jobPostingId: number;
}

/**
 * Chat service: tập hợp các API methods cho module chat
 * Sử dụng api-client (get/post/put) với response type là { success, data }
 */
export const chatService = {
  /** Lấy danh sách tất cả hội thoại của user hiện tại */
  async getConversations(): Promise<Conversation[]> {
    const res = await get<{ success: boolean; data: Conversation[] }>('/chat/conversations');
    return res.data;
  },

  /** Tạo hội thoại mới (chỉ candidate có quyền) */
  async createConversation(payload: CreateConversationPayload): Promise<Conversation> {
    const res = await post<{ success: boolean; data: Conversation }>('/chat/conversations', payload);
    return res.data;
  },

  /** Lấy tin nhắn của hội thoại (phân trang) */
  async getMessages(conversationId: number, page = 1, limit = 50): Promise<{ items: Message[] }> {
    const res = await get<{ success: boolean; data: Message[] }>(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    return { items: res.data };
  },

  /**
   * Lấy danh sách applications của ứng viên trong hội thoại (chỉ recruiter)
   * Dùng để hiển thị sidebar phải "Hồ sơ ứng tuyển"
   */
  async getConversationApplications(conversationId: number): Promise<RecruiterApplication[]> {
    const res = await get<{ success: boolean; data: RecruiterApplication[] }>(`/chat/conversations/${conversationId}/applications`);
    return res.data;
  },

  /** Gửi tin nhắn văn bản */
  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const res = await post<{ success: boolean; data: Message }>(`/chat/conversations/${conversationId}/messages`, { content });
    return res.data;
  },

  /**
   * Upload file đính kèm (kèm nội dung text tùy chọn)
   * Gửi dạng FormData với field "file" và "content"
   */
  async uploadAttachment(conversationId: number, file: File, content?: string): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    if (content) {
      formData.append('content', content);
    }
    const res = await post<{ success: boolean; data: Message }>(`/chat/conversations/${conversationId}/attachments`, formData);
    return res.data;
  },

  /** Đánh dấu một tin nhắn đã được đọc */
  async markMessageRead(messageId: number): Promise<Message> {
    const res = await put<{ success: boolean; data: Message }>(`/chat/messages/${messageId}/read`);
    return res.data;
  },

  /** Lấy tổng số tin nhắn chưa đọc của user (dùng cho badge trên sidebar/menu) */
  async getUnreadCount(): Promise<number> {
    const res = await get<{ success: boolean; data: { count: number } }>('/chat/conversations/unread-count');
    return res.data.count;
  }
};
