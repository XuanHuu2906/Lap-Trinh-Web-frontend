export type NotificationType = 
  | 'application_submitted' 
  | 'new_applicant' 
  | 'feedback_received' 
  | 'status_updated' 
  | 'new_message' 
  | 'system';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedType?: string | null; // e.g. 'application', 'job_posting'
  relatedId?: number | null;
  isRead: boolean;
  createdAt: string;
}
