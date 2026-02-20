import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  status: z.enum(['open', 'in_progress', 'closed']).default('open'),
  assignee: z.string().min(1).max(100),
  priority: z.number().int().min(1).max(5).default(3),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  assignee: z.string().min(1).max(100).optional(),
  priority: z.number().int().min(1).max(5).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
});

export const bulkIdsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  updates: updateTaskSchema,
});
