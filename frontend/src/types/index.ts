export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Job {
  _id: string;
  userId: string;
  company: string;
  role: string;
  description?: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  currentStatus: 'applied' | 'interview' | 'offer' | 'rejected';
  statusHistory: StatusHistoryItem[];
  resumeFile?: {
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  };
  applicationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  date: string;
  notes?: string;
  _id: string;
}

export interface JobStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
