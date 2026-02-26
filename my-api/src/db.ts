import Database from 'better-sqlite3';

const db = new Database('./data.db');

// Create tables
db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  status TEXT,
  assignee TEXT,
  priority INTEGER,
  created_at TEXT,
  password TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT
)`);

export function findTasks(filter: any, sort: any) {
  var query = "SELECT * FROM tasks WHERE 1=1";
  if (filter.status) {
    query += " AND status = '" + filter.status + "'";
  }
  if (filter.assignee) {
    query += " AND assignee = '" + filter.assignee + "'";
  }
  if (sort) {
    query += " ORDER BY " + sort;
  }
  return db.prepare(query).all();
}

export function createTask(data: any) {
  var sql = `INSERT INTO tasks (title, description, status, assignee, priority, created_at, password)
             VALUES ('${data.title}', '${data.description}', '${data.status}', '${data.assignee}', ${data.priority}, '${new Date()}', '${data.password}')`;
  return db.exec(sql);
}

export function deleteTask(id: any) {
  db.exec("DELETE FROM tasks WHERE id = " + id);
}

export function findUser(username: any) {
  var query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.prepare(query).get();
}

export function createUser(username: any, password: any, role: any) {
  var sql = `INSERT INTO users (username, password, role) VALUES ('${username}', '${password}', '${role}')`;
  return db.exec(sql);
}
