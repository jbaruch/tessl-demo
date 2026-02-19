import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH || './data.db');
db.pragma('journal_mode = WAL');

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
)`);

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  assignee TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

export function findUser(username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password: string; role: string }
    | undefined;
}

export function createUser(username: string, hashedPassword: string, role: string) {
  return db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
    username,
    hashedPassword,
    role
  );
}

export function findTasks(
  filter: { status?: string; assignee?: string },
  sort?: string
) {
  const conditions: string[] = ['1=1'];
  const params: unknown[] = [];

  if (filter.status) {
    conditions.push('status = ?');
    params.push(filter.status);
  }
  if (filter.assignee) {
    conditions.push('assignee = ?');
    params.push(filter.assignee);
  }

  const allowedSortColumns = ['created_at', 'priority', 'status', 'title'];
  const orderClause =
    sort && allowedSortColumns.includes(sort) ? ` ORDER BY ${sort}` : '';

  return db
    .prepare(
      `SELECT * FROM tasks WHERE ${conditions.join(' AND ')}${orderClause}`
    )
    .all(...params) as Array<{
    id: number;
    title: string;
    description: string;
    status: string;
    assignee: string;
    priority: number;
    created_at: string;
    updated_at: string;
  }>;
}

export function findTaskById(id: number) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
    | {
        id: number;
        title: string;
        description: string;
        status: string;
        assignee: string;
        priority: number;
        created_at: string;
        updated_at: string;
      }
    | undefined;
}

export function createTask(data: {
  title: string;
  description: string;
  status: string;
  assignee: string;
  priority: number;
}) {
  return db
    .prepare(
      'INSERT INTO tasks (title, description, status, assignee, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
    )
    .run(data.title, data.description, data.status, data.assignee, data.priority);
}

export function updateTask(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    assignee: string;
    priority: number;
  }>
) {
  const fields: string[] = [];
  const params: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }

  fields.push('updated_at = datetime("now")');
  params.push(id);

  return db
    .prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`)
    .run(...params);
}

export function deleteTask(id: number) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

export function getTaskStats() {
  const open = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'open'")
    .get() as { count: number };
  const closed = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'closed'")
    .get() as { count: number };
  const inProgress = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'")
    .get() as { count: number };

  return {
    open: open.count,
    closed: closed.count,
    inProgress: inProgress.count,
  };
}
