import { Request } from 'express';
import { UserRole } from '@prisma/client';

// Extend Express Request to include user info from JWT
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// User registration DTO
export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  expertise?: string[];
  contactInfo?: Record<string, any>;
  bio?: string;
}

// User login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// Update profile DTO
export interface UpdateProfileDto {
  name?: string;
  bio?: string;
  expertise?: string[];
  contactInfo?: Record<string, any>;
  avatar?: string;

  // Profile-specific fields
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

// Create application DTO
export interface CreateApplicationDto {
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
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  additionalComments?: string;
  attachments?: string[];
}

// Update application status DTO (admin only)
export interface UpdateApplicationDto {
  status?: 'NEW' | 'IN_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  assignedTo?: string;
  adminNotes?: string;
}

// Reputation update DTO
export interface AddReputationDto {
  userId: string;
  points: number;
  reason: string;
  sourceType: string;
  sourceId?: string;
}

// API Response types
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
