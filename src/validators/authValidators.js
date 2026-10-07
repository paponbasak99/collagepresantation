import { z } from 'zod';

const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const registerSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Please provide a valid 11-digit Bangladesh phone number (e.g. 01711000000)'),
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['patient', 'doctor']).default('patient'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().max(255).optional(),
  // If doctor registration
  specialtyId: z.number().int().optional(),
  hospitalId: z.number().int().optional(),
  bmdcRegNo: z.string().optional(),
  qualifications: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  consultationFee: z.number().positive().optional(),
  chamberAddress: z.string().optional()
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be a 6-digit code')
});

export const loginSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  blood_group: z.string().max(5).optional(),
  address: z.string().max(255).optional()
});
