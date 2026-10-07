import { z } from 'zod';

const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const bookAppointmentSchema = z.object({
  slotId: z.number().int().positive('Valid slot ID is required'),
  patientType: z.enum(['SELF', 'FAMILY']).default('SELF'),
  patientName: z.string().min(2, 'Patient name must be at least 2 characters').max(100),
  patientPhone: z.string().regex(phoneRegex, 'Valid Bangladesh phone number required'),
  patientAge: z.number().int().min(1).max(120, 'Please enter a valid age'),
  patientGender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  patientRelation: z.string().max(50).optional().default('Self'),
  reasonForVisit: z.string().min(3, 'Please describe reason for visit (min 3 chars)').max(500),
  notes: z.string().max(1000).optional().or(z.literal('')),
  isEmergency: z.boolean().optional().default(false),
  emergencyNotes: z.string().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['BKASH', 'NAGAD', 'CASH_AT_CLINIC']),
  transactionRef: z.string().optional(),
  idempotencyKey: z.string().optional()
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(300).optional().default('Cancelled by patient')
});

export const rescheduleAppointmentSchema = z.object({
  newSlotId: z.number().int().positive('Target slot ID is required')
});
