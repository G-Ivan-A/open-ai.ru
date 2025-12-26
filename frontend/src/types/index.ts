// User types
export type UserRole = 'STARTUP' | 'SPECIALIST' | 'SME' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  expertise: string[];
  contactInfo?: Record<string, any>;
  reputationPoints: number;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  companyName?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  yearsExperience?: number;
  certifications?: string[];
  portfolio?: Record<string, any>;
  businessType?: string;
  industry?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Application types
export type ApplicationStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Application {
  id: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  businessDescription: string;
  companyName?: string;
  industry: string;
  automationGoal: string;
  targetProcess: string;
  expectedResults?: string;
  budget?: string;
  timeline?: string;
  urgency: UrgencyLevel;
  additionalComments?: string;
  attachments: string[];
  status: ApplicationStatus;
  assignedTo?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// Form data types
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  expertise?: string[];
  contactInfo?: Record<string, any>;
  bio?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UpdateProfileFormData {
  name?: string;
  bio?: string;
  expertise?: string[];
  contactInfo?: Record<string, any>;
  avatar?: string;
  companyName?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  yearsExperience?: number;
  certifications?: string[];
  portfolio?: Record<string, any>;
  businessType?: string;
  industry?: string;
  employeeCount?: number;
}

export interface CreateApplicationFormData {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  businessDescription: string;
  companyName?: string;
  industry: string;
  automationGoal: string;
  targetProcess: string;
  expectedResults?: string;
  budget?: string;
  timeline?: string;
  urgency?: UrgencyLevel;
  additionalComments?: string;
  attachments?: string[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}
