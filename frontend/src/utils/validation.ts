import { z } from 'zod';

// Application form validation schema
export const applicationFormSchema = z.object({
  contactName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  contactEmail: z.string().email('Некорректный email'),
  contactPhone: z.string().max(50).optional().or(z.literal('')),
  businessDescription: z
    .string()
    .min(50, 'Описание бизнеса должно содержать минимум 50 символов')
    .max(5000),
  companyName: z.string().max(200).optional().or(z.literal('')),
  industry: z.string().min(1, 'Укажите отрасль').max(100),
  automationGoal: z
    .string()
    .min(50, 'Цель автоматизации должна содержать минимум 50 символов')
    .max(5000),
  targetProcess: z
    .string()
    .min(50, 'Целевой процесс должен содержать минимум 50 символов')
    .max(5000),
  expectedResults: z.string().max(5000).optional().or(z.literal('')),
  budget: z.string().max(100).optional().or(z.literal('')),
  timeline: z.string().max(100).optional().or(z.literal('')),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  additionalComments: z.string().max(5000).optional().or(z.literal('')),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100).optional(),
  bio: z.string().max(1000).optional().or(z.literal('')),
  expertise: z.array(z.string()).optional(),
  contactInfo: z.record(z.any()).optional(),
  avatar: z.string().url('Некорректный URL').optional().or(z.literal('')),
  companyName: z.string().max(200).optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  foundedYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .or(z.nan()),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  yearsExperience: z.number().int().min(0).max(100).optional().or(z.nan()),
  certifications: z.array(z.string()).optional(),
  portfolio: z.record(z.any()).optional(),
  businessType: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  employeeCount: z.number().int().min(0).optional().or(z.nan()),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
