import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional()
})

export const clientUpdateSchema = clientSchema.partial()

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative')
})

export const invoiceSchema = z.object({
  clientId: z.number().int().positive('clientId is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  tax: z.number().nonnegative('Tax cannot be negative').optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required')
})

export const invoiceUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional()
})