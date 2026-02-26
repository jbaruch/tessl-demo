import { Router, Response } from 'express';
import { createUser, findUserByUsername, findTodos, getTodoById, createTodo, updateTodo, deleteTodo } from './db';
import { AuthRequest, authMiddleware, hashPassword, verifyPassword, generateToken } from './auth';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  if (findUserByUsername(username)) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(username, passwordHash);
  const token = generateToken(user.id);

  res.status(201).json({ token, user: { id: user.id, username: user.username } });
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = findUserByUsername(username);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, username: user.username } });
});

// All routes below require authentication
router.use(authMiddleware);

router.get('/todos', (req: AuthRequest, res: Response) => {
  const todos = findTodos(req.userId!, req.query as { completed?: string; priority?: string; sort?: string });
  res.json(todos);
});

router.get('/todos/:id', (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid todo ID' });
    return;
  }

  const todo = getTodoById(id, req.userId!);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  res.json(todo);
});

router.post('/todos', (req: AuthRequest, res: Response) => {
  const { title, description, priority } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  if (priority !== undefined && (typeof priority !== 'number' || priority < 1 || priority > 5)) {
    res.status(400).json({ error: 'Priority must be a number between 1 and 5' });
    return;
  }

  const todo = createTodo(req.userId!, { title, description, priority });
  res.status(201).json(todo);
});

router.put('/todos/:id', (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid todo ID' });
    return;
  }

  const todo = updateTodo(id, req.userId!, req.body);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  res.json(todo);
});

router.delete('/todos/:id', (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid todo ID' });
    return;
  }

  const deleted = deleteTodo(id, req.userId!);
  if (!deleted) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  res.json({ message: 'Todo deleted' });
});

export default router;
