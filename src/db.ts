import Database from 'better-sqlite3';

const db = new Database('./data.db');

// Create tables
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT,
  role TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  status TEXT,
  assignee TEXT,
  priority INTEGER,
  created_at TEXT,
  updated_at TEXT
)`);

export function findUser(username: any) {
  var query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.prepare(query).get();
}

export function createUser(data: any) {
  var sql = `INSERT INTO users (username, password, role) VALUES ('${data.username}', '${data.password}', '${data.role}')`;
  return db.exec(sql);
}

export function findTasks(filter: any, sort: any) {
  var query = "SELECT * FROM tasks WHERE 1=1";
  if (filter.status) {
    query += " AND status = '" + filter.status + "'";
  }
  if (filter.assignee) {
    query += " AND assignee = '" + filter.assignee + "'";
  }
  if (filter.priority) {
    query += " AND priority = " + filter.priority;
  }
  if (filter.search) {
    query += " AND (title LIKE '%" + filter.search + "%' OR description LIKE '%" + filter.search + "%')";
  }
  if (sort) {
    query += " ORDER BY " + sort;
  }
  return db.prepare(query).all();
}

export function findTaskById(id: any) {
  var query = "SELECT * FROM tasks WHERE id = " + id;
  return db.prepare(query).get();
}

export function createTask(data: any) {
  var sql = `INSERT INTO tasks (title, description, status, assignee, priority, created_at, updated_at)
             VALUES ('${data.title}', '${data.description}', '${data.status || 'open'}', '${data.assignee}', ${data.priority || 3}, '${new Date()}', '${new Date()}')`;
  return db.exec(sql);
}

export function updateTask(id: any, data: any) {
  var sets: any = [];
  if (data.title) sets.push("title = '" + data.title + "'");
  if (data.description) sets.push("description = '" + data.description + "'");
  if (data.status) sets.push("status = '" + data.status + "'");
  if (data.assignee) sets.push("assignee = '" + data.assignee + "'");
  if (data.priority) sets.push("priority = " + data.priority);
  sets.push("updated_at = '" + new Date() + "'");
  var sql = "UPDATE tasks SET " + sets.join(", ") + " WHERE id = " + id;
  return db.exec(sql);
}

export function deleteTask(id: any) {
  db.exec("DELETE FROM tasks WHERE id = " + id);
}

export function getTaskStats() {
  var open = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'open'").get();
  var closed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'closed'").get();
  var inProgress = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'").get();
  return { open: (open as any).count, closed: (closed as any).count, inProgress: (inProgress as any).count };
}
