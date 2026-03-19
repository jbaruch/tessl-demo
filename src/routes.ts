import { Router } from 'express';
import { findTodos, findTodoById, createTodo, updateTodo, markComplete, deleteTodo, createUser } from './db';
import { authMiddleware, login, hashPassword } from './auth';

const router = Router();

// Public routes
router.post('/register', async (req: any, res: any) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
  const hashed = await hashPassword(password);
  createUser(username, hashed, role);
  res.status(201).json({ status: 'registered' });
});

router.post('/login', async (req: any, res: any) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
  const token = await login(username, password);
  token ? res.json({ token }) : res.status(401).json({ error: 'Invalid credentials' });
});

// Protected routes
router.use(authMiddleware);

router.get('/todos', (req: any, res: any) => {
  try {
    res.json(findTodos({ completed: req.query.completed, assignee: req.query.assignee }, req.query.sort));
  } catch {
    res.status(500).json({ error: 'Failed to retrieve todos' });
  }
});

router.get('/todos/:id', (req: any, res: any) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid todo ID' });
  const todo = findTodoById(id);
  todo ? res.json(todo) : res.status(404).json({ error: 'Todo not found' });
});

router.post('/todos', (req: any, res: any) => {
  const { title, description, assignee, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = createTodo({ title, description, assignee, priority });
  res.status(201).json({ id: result.lastInsertRowid, status: 'created' });
});

router.put('/todos/:id', (req: any, res: any) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid todo ID' });
  if (!findTodoById(id)) return res.status(404).json({ error: 'Todo not found' });
  updateTodo(id, req.body);
  res.json({ status: 'updated' });
});

router.patch('/todos/:id/complete', (req: any, res: any) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid todo ID' });
  if (!findTodoById(id)) return res.status(404).json({ error: 'Todo not found' });
  markComplete(id);
  res.json({ status: 'completed' });
});

router.delete('/todos/:id', (req: any, res: any) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid todo ID' });
  deleteTodo(id);
  res.json({ status: 'deleted' });
});

// Export — stream JSON directly, no temp files
router.get('/todos/export', (req: any, res: any) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="todos.json"');
  res.send(JSON.stringify(findTodos({}), null, 2));
});

// Import — JSON.parse, never eval
router.post('/todos/import', (req: any, res: any) => {
  try {
    const parsed: any[] = JSON.parse(req.body.data);
    if (!Array.isArray(parsed)) return res.status(400).json({ error: 'Expected an array' });
    let imported = 0;
    for (const item of parsed) {
      if (item.title) { createTodo(item); imported++; }
    }
    res.json({ status: 'imported', count: imported });
  } catch {
    res.status(400).json({ error: 'Invalid JSON data' });
  }
});

// HTML report — escaped output
router.get('/todos/report', (req: any, res: any) => {
  const rows = (findTodos({}) as any[])
    .map(t => `<tr><td>${escapeHtml(t.title)}</td><td>${escapeHtml(t.description || '')}</td><td>${t.completed ? 'Done' : 'Pending'}</td></tr>`)
    .join('');
  res.setHeader('Content-Type', 'text/html');
  res.send(`<html><body><h1>Todo Report</h1><table><tr><th>Title</th><th>Description</th><th>Status</th></tr>${rows}</table></body></html>`);
});

function escapeHtml(str: string): string {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default router;
