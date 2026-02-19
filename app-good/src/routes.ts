import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  findTasks,
  findTaskById,
  createTask,
  updateTask,
  deleteTask,
  findUser,
  createUser,
  getTaskStats,
} from './db';
import {
  authMiddleware,
  requireRole,
  hashPassword,
  verifyPassword,
  generateToken,
} from './auth';
import {
  createTaskSchema,
  updateTaskSchema,
  loginSchema,
  registerSchema,
  bulkIdsSchema,
  bulkUpdateSchema,
} from './validation';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const user = findUser(result.data.username);
  if (!user || !(await verifyPassword(result.data.password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken({ id: user.id, username: user.username, role: user.role });
  res.json({ token });
});

router.post('/register', async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const existing = findUser(result.data.username);
  if (existing) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const hashedPassword = await hashPassword(result.data.password);
  const inserted = createUser(result.data.username, hashedPassword, 'user');
  const token = generateToken({
    id: Number(inserted.lastInsertRowid),
    username: result.data.username,
    role: 'user',
  });
  res.status(201).json({ token });
});

router.get('/tasks', authMiddleware, (req: Request, res: Response) => {
  const tasks = findTasks(
    { status: req.query.status as string, assignee: req.query.assignee as string },
    req.query.sort as string
  );
  res.json({ data: tasks, total: tasks.length });
});

router.get('/tasks/stats', authMiddleware, (req: Request, res: Response) => {
  const stats = getTaskStats();
  res.json(stats);
});

router.get('/tasks/:id', authMiddleware, (req: Request, res: Response) => {
  const task = findTaskById(Number(req.params.id));
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

router.post('/tasks', authMiddleware, (req: Request, res: Response) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }
  const task = createTask(result.data);
  res.status(201).json({ id: task.lastInsertRowid });
});

router.put('/tasks/:id', authMiddleware, (req: Request, res: Response) => {
  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const existing = findTaskById(Number(req.params.id));
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  updateTask(Number(req.params.id), result.data);
  res.json({ message: 'Task updated' });
});

router.delete('/tasks/:id', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const result = deleteTask(Number(req.params.id));
  if (result.changes === 0) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(204).send();
});

router.post('/tasks/bulk/update', authMiddleware, (req: Request, res: Response) => {
  const result = bulkUpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  for (const id of result.data.ids) {
    updateTask(id, result.data.updates);
  }
  res.json({ updated: result.data.ids.length });
});

router.post('/tasks/bulk/delete', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const result = bulkIdsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  for (const id of result.data.ids) {
    deleteTask(id);
  }
  res.status(204).send();
});

export default router;
