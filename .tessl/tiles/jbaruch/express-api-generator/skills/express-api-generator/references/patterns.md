# Code Patterns Reference

Complete code examples for each component.

## Database - Full Module

```typescript
import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH || './data.db');
db.pragma('journal_mode = WAL');

export function findById(id: number) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

export function createTask(data: { title: string; description: string; status: string; assignee: string; priority: number }) {
  return db.prepare(
    'INSERT INTO tasks (title, description, status, assignee, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
  ).run(data.title, data.description, data.status, data.assignee, data.priority);
}

export function updateTask(id: number, data: Partial<{ title: string; description: string; status: string; assignee: string; priority: number }>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = ?`); params.push(value); }
  }
  fields.push('updated_at = datetime("now")');
  params.push(id);
  return db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...params);
}

export function deleteTask(id: number) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}
```

## Authentication - Password Hashing & Tokens

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

const SALT_ROUNDS = 12;

interface TokenPayload { id: number; username: string; role: string }

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}
```

## Routes - Additional Patterns

```typescript
router.get('/tasks', authMiddleware, (req: Request, res: Response) => {
  const tasks = findTasks({ status: req.query.status as string, assignee: req.query.assignee as string }, req.query.sort as string);
  res.json({ data: tasks, total: tasks.length });
});

router.get('/tasks/:id', authMiddleware, (req: Request, res: Response) => {
  const task = findById(Number(req.params.id));
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  res.json(task);
});

router.delete('/tasks/:id', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const result = deleteTask(Number(req.params.id));
  if (result.changes === 0) { res.status(404).json({ error: 'Task not found' }); return; }
  res.status(204).send();
});
```

## Server - Full Setup

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import router from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || [] }));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

app.use('/api', router);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
```
