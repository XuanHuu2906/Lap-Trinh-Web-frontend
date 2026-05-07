export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'cancelled';

export interface Application {
  id: number;
  candidateProfileId: number;
  jobPostingId: number;
  cvId: number;
  coverLetter?: string | null;
  status: ApplicationStatus;
  deletedAt?: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationFeedback {
  id: number;
  applicationId: number;
  recruiterProfileId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationEvaluation {
  id: number;
  applicationId: number;
  recruiterProfileId: number;
  score?: number | null; // TINYINT 0-10
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
