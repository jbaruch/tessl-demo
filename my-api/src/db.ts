import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '..', 'todo.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 3,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: number;
  priority: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export function createUser(username: string, passwordHash: string): User {
  const stmt = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  );
  const result = stmt.run(username, passwordHash);
  return getUserById(result.lastInsertRowid as number)!;
}

export function findUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function findTodos(userId: number, filters: { completed?: string; priority?: string; sort?: string }): Todo[] {
  let query = 'SELECT * FROM todos WHERE user_id = ?';
  const params: (number | string)[] = [userId];

  if (filters.completed !== undefined) {
    query += ' AND completed = ?';
    params.push(filters.completed === 'true' ? 1 : 0);
  }

  if (filters.priority !== undefined) {
    const priority = parseInt(filters.priority, 10);
    if (!isNaN(priority) && priority >= 1 && priority <= 5) {
      query += ' AND priority = ?';
      params.push(priority);
    }
  }

  const allowedSortFields = ['created_at', 'updated_at', 'priority', 'title'];
  const sortField = allowedSortFields.includes(filters.sort || '') ? filters.sort : 'created_at';
  query += ` ORDER BY ${sortField} DESC`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as Todo[];
}

export function getTodoById(id: number, userId: number): Todo | undefined {
  const stmt = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?');
  return stmt.get(id, userId) as Todo | undefined;
}

export function createTodo(userId: number, data: { title: string; description?: string; priority?: number }): Todo {
  const stmt = db.prepare(
    `INSERT INTO todos (title, description, priority, user_id) VALUES (?, ?, ?, ?)`
  );
  const result = stmt.run(data.title, data.description || null, data.priority || 3, userId);
  return getTodoById(result.lastInsertRowid as number, userId)!;
}

export function updateTodo(id: number, userId: number, data: { title?: string; description?: string; completed?: boolean; priority?: number }): Todo | undefined {
  const existing = getTodoById(id, userId);
  if (!existing) return undefined;

  const stmt = db.prepare(
    `UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`
  );
  stmt.run(
    data.title ?? existing.title,
    data.description ?? existing.description,
    data.completed !== undefined ? (data.completed ? 1 : 0) : existing.completed,
    data.priority ?? existing.priority,
    id,
    userId
  );
  return getTodoById(id, userId);
}

export function deleteTodo(id: number, userId: number): boolean {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

export { db };
