import { z } from 'zod';
import { Priority, Status } from '../types';

export const AssigneeSchema = z.object({
  assigneeId: z.string().trim().min(1, 'Assignee ID is required'),
  assigneeName: z.string().trim().min(2, 'Assignee name must be at least 2 characters').max(100, 'Assignee name cannot exceed 100 characters'),
  avatarUrl: z.string().url('Invalid URL format for avatar').nullable().optional(),
});

export const TaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { 
    errorMap: () => ({ message: 'Invalid priority level. Must be low, medium, high, or urgent.' })
  }),
  dueDate: z.string().datetime('Invalid due date format').nullable(),
  assignee: AssigneeSchema,
  status: z.enum(['todo', 'in_progress', 'done'], { 
    errorMap: () => ({ message: 'Invalid status. Must be todo, in_progress, or done.' })
  }),
  createdAt: z.string().datetime('Invalid created date format'),
  updatedAt: z.string().datetime('Invalid updated date format'),
  order: z.number().int('Order must be an integer').min(0, 'Order cannot be negative').or(z.number()),
  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty').max(30, 'Tag cannot exceed 30 characters')).max(10, 'Maximum of 10 tags allowed').default([]),
  archived: z.boolean().default(false),
  estimate: z.number().nonnegative('Estimate cannot be negative').max(999, 'Estimate is too large').nullable().default(null),
  lastMovedAt: z.string().datetime('Invalid moved date format'),
}).superRefine((data, ctx) => {
  if (data.priority === 'urgent' && !data.dueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A due date must be set when priority is urgent',
      path: ['dueDate']
    });
  }
});

const CreateTaskBaseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { 
    errorMap: () => ({ message: 'Invalid priority level. Must be low, medium, high, or urgent.' })
  }),
  dueDate: z.union([
    z.string().datetime('Due date must be a valid ISO 8601 string'), 
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (must be YYYY-MM-DD)'),
    z.literal(''),
    z.null()
  ])
  .transform(val => {
    if (!val || val === '') return null;
    if (val.length === 10) return new Date(`${val}T00:00:00.000Z`).toISOString();
    return val;
  })
  .optional()
  .default(null),
  assignee: AssigneeSchema.optional().default({ assigneeId: 'u1', assigneeName: 'Alice' }),
  status: z.enum(['todo', 'in_progress', 'done'], { 
    errorMap: () => ({ message: 'Invalid status. Must be todo, in_progress, or done.' })
  }),
  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty').max(30, 'Tag cannot exceed 30 characters')).max(10, 'Maximum of 10 tags allowed').optional().default([]),
  estimate: z.number().nonnegative('Estimate cannot be negative').max(999, 'Estimate is too large').nullable().optional().default(null),
});

export const CreateTaskSchema = CreateTaskBaseSchema.superRefine((data, ctx) => {
  if (data.priority === 'urgent' && !data.dueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A due date must be set when priority is urgent',
      path: ['dueDate']
    });
  }
});

export const UpdateTaskSchema = CreateTaskBaseSchema.partial().omit({ assignee: true }).extend({
    assignee: AssigneeSchema.optional()
}).superRefine((data, ctx) => {
  if (data.priority === 'urgent' && data.dueDate === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A due date must be set when priority is urgent',
      path: ['dueDate']
    });
  }
});

