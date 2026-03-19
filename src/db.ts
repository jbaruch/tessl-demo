import Database from 'better-sqlite3';

const db = new Database('./data.db');

db.exec(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  assignee TEXT,
  priority INTEGER DEFAULT 1,
  created_at TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT DEFAULT 'user'
)`);

export function findTodos(filter: { completed?: string; assignee?: string }, sort?: string) {
  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];

  if (filter.completed !== undefined) { conditions.push('completed = ?'); params.push(filter.completed); }
  if (filter.assignee) { conditions.push('assignee = ?'); params.push(filter.assignee); }

  const allowedSortColumns = ['id', 'title', 'completed', 'assignee', 'priority', 'created_at'];
  const orderBy = allowedSortColumns.includes(sort ?? '') ? ` ORDER BY ${sort}` : '';

  return db.prepare(`SELECT * FROM todos WHERE ${conditions.join(' AND ')}${orderBy}`).all(...params);
}

export function findTodoById(id: number) {
  return db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
}

export function createTodo(data: { title: string; description?: string; assignee?: string; priority?: number }) {
  return db.prepare(
    `INSERT INTO todos (title, description, completed, assignee, priority, created_at) VALUES (?, ?, 0, ?, ?, ?)`
  ).run(data.title, data.description || null, data.assignee || null, data.priority || 1, new Date().toISOString());
}

export function updateTodo(id: number, data: { title: string; description: string; completed: number; assignee: string; priority: number }) {
  return db.prepare(
    `UPDATE todos SET title = ?, description = ?, completed = ?, assignee = ?, priority = ? WHERE id = ?`
  ).run(data.title, data.description, data.completed, data.assignee, data.priority, id);
}

export function markComplete(id: number) {
  return db.prepare('UPDATE todos SET completed = 1 WHERE id = ?').run(id);
}

export function deleteTodo(id: number) {
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
}

export function findUser(username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number; username: string; role: string; passwordHash: string } | undefined;
}

export function createUser(username: string, passwordHash: string, role: string) {
  return db.prepare('INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)').run(username, passwordHash, role || 'user');
}
