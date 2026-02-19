---
name: express-api-generator
description: Generates Express.js REST API endpoints with TypeScript following security best practices. Use when the user asks to create a REST API, backend service, or CRUD endpoints. Produces code with parameterized SQL queries, bcrypt password hashing, JWT via environment variables, input validation with zod, helmet security headers, proper error handling, and typed request/response handlers.
compatibility: Designed for Claude Code. Requires Node.js 20+.
---

# Express REST API Generator

Generate a secure, production-ready Express.js REST API with TypeScript. Follow these steps in order. Complete each checkpoint before proceeding.

## Step 1: Initialize Project

Create `package.json`, `tsconfig.json` (with `strict: true`), and `.env.example` listing:
- `JWT_SECRET` - signing key for tokens
- `DB_PATH` - SQLite database path
- `ALLOWED_ORIGINS` - comma-separated CORS origins

Install dependencies: express, zod, jsonwebtoken, better-sqlite3, bcrypt, helmet, cors, express-rate-limit and their type packages.

**Checkpoint:** Run `npx tsc --noEmit` — must compile cleanly.

## Step 2: Database Layer (src/db.ts)

Every query uses `?` placeholders. Whitelist sort columns.

```typescript
const db = new Database(process.env.DB_PATH || './data.db');
db.pragma('journal_mode = WAL');

export function findTasks(filter: { status?: string; assignee?: string }, sort?: string) {
  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];
  if (filter.status) { conditions.push('status = ?'); params.push(filter.status); }
  if (filter.assignee) { conditions.push('assignee = ?'); params.push(filter.assignee); }
  const allowedSort = ['created_at', 'priority', 'status', 'title'];
  const order = sort && allowedSort.includes(sort) ? ` ORDER BY ${sort}` : '';
  return db.prepare(`SELECT * FROM tasks WHERE ${conditions.join(' AND ')}${order}`).all(...params);
}
```

See [references/patterns.md](./references/patterns.md) for insert, update, and delete patterns.

**Checkpoint:** Insert a row and query it back to verify the schema.

## Step 3: Validation Schemas (src/validation.ts)

Define zod schemas for every request body and query parameter:

```typescript
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  status: z.enum(['open', 'in_progress', 'closed']).default('open'),
  assignee: z.string().min(1).max(100),
  priority: z.number().int().min(1).max(5).default(3),
});
```

**Checkpoint:** Verify schemas reject empty strings, out-of-range numbers, and unknown fields.

## Step 4: Authentication (src/auth.ts)

Load secret from environment, fail fast if missing. Hash with bcrypt, never include passwords in tokens.

```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET) as TokenPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

See [references/patterns.md](./references/patterns.md) for password hashing and token generation.

**Checkpoint:** Confirm server refuses to start without `JWT_SECRET` and returns 401 for invalid tokens.

## Step 5: Route Handlers (src/routes.ts)

Validate all input before processing. Return proper status codes.

```typescript
router.post('/tasks', authMiddleware, (req: Request, res: Response) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }
  const task = createTask(result.data);
  res.status(201).json({ id: task.lastInsertRowid });
});
```

See [references/patterns.md](./references/patterns.md) for additional route patterns.

**Checkpoint:** Test each endpoint — validation rejects bad input, auth blocks unauthenticated requests.

## Step 6: Server Entrypoint (src/index.ts)

```typescript
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || [] }));
app.use('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use(express.json({ limit: '1mb' }));
```

**Checkpoint:** Start the server, verify all endpoints respond, confirm security headers in responses.
