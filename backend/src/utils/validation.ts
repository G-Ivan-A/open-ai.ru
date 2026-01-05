import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['STARTUP', 'SPECIALIST', 'SME', 'ADMIN']),
  expertise: z.array(z.string()).optional(),
  contactInfo: z.record(z.any()).optional(),
  bio: z.string().max(1000).optional(),
});

// User login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Update profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  expertise: z.array(z.string()).optional(),
  contactInfo: z.record(z.any()).optional(),
  avatar: z.string().url().optional(),

  // Profile-specific fields
  companyName: z.string().max(200).optional(),
  companySize: z.string().optional(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  certifications: z.array(z.string()).optional(),
  portfolio: z.record(z.any()).optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().int().min(0).optional(),
});

// Create application validation
export const createApplicationSchema = z.object({
  contactName: z.string().min(2, 'Contact name is required').max(100),
  contactEmail: z.string().email('Invalid email format'),
  contactPhone: z.string().max(50).optional(),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters').max(5000),
  companyName: z.string().max(200).optional(),
  industry: z.string().min(1, 'Industry is required').max(100),
  automationGoal: z.string().min(50, 'Automation goal must be at least 50 characters').max(5000),
  targetProcess: z.string().min(50, 'Target process must be at least 50 characters').max(5000),
  expectedResults: z.string().max(5000).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  additionalComments: z.string().max(5000).optional(),
  attachments: z.array(z.string().url()).optional(),
});

// Update application status validation (admin)
export const updateApplicationSchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
  assignedTo: z.string().uuid().optional(),
  adminNotes: z.string().max(5000).optional(),
});

// Add reputation validation
export const addReputationSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int(),
  reason: z.string().min(10).max(500),
  sourceType: z.string().min(1).max(100),
  sourceId: z.string().uuid().optional(),
});
