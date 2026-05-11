import { z } from 'zod';
import { Priority, Status } from '../types';

export const AssigneeSchema = z.object({
  assigneeId: z.string(),
  assigneeName: z.string(),
  avatarUrl: z.string().nullable().optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().nullable(),
  assignee: AssigneeSchema,
  status: z.enum(['todo', 'in_progress', 'done']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  order: z.number(),
  tags: z.array(z.string()).default([]),
  archived: z.boolean().default(false),
  estimate: z.number().nullable().default(null),
  lastMovedAt: z.string().datetime(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().nullable().optional().default(null),
  assignee: AssigneeSchema,
  status: z.enum(['todo', 'in_progress', 'done']),
  tags: z.array(z.string()).optional().default([]),
  estimate: z.number().nullable().optional().default(null),
});
