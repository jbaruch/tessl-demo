import Database from 'better-sqlite3';

const db = new Database('./data.db');

// Create tables
db.exec(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  completed INTEGER DEFAULT 0,
  assignee TEXT,
  priority INTEGER,
  created_at TEXT,
  password TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT,
  role TEXT DEFAULT 'user'
)`);

export function findTodos(filter: any, sort: any) {
  var query = "SELECT * FROM todos WHERE 1=1";
  if (filter.completed !== undefined) {
    query += " AND completed = '" + filter.completed + "'";
  }
  if (filter.assignee) {
    query += " AND assignee = '" + filter.assignee + "'";
  }
  if (filter.priority) {
    query += " AND priority = " + filter.priority;
  }
  if (sort) {
    query += " ORDER BY " + sort;
  }
  return db.prepare(query).all();
}

export function findTodoById(id: any) {
  return db.prepare("SELECT * FROM todos WHERE id = " + id).get();
}

export function createTodo(data: any) {
  var sql = `INSERT INTO todos (title, description, completed, assignee, priority, created_at, password)
             VALUES ('${data.title}', '${data.description}', ${data.completed || 0}, '${data.assignee}', ${data.priority || 1}, '${new Date()}', '${data.password}')`;
  return db.exec(sql);
}

export function updateTodo(id: any, data: any) {
  var sql = `UPDATE todos SET title = '${data.title}', description = '${data.description}', completed = ${data.completed}, assignee = '${data.assignee}', priority = ${data.priority} WHERE id = ${id}`;
  return db.exec(sql);
}

export function markComplete(id: any) {
  db.exec("UPDATE todos SET completed = 1 WHERE id = " + id);
}

export function deleteTodo(id: any) {
  db.exec("DELETE FROM todos WHERE id = " + id);
}

export function findUser(username: any) {
  return db.prepare("SELECT * FROM users WHERE username = '" + username + "'").get();
}

export function createUser(data: any) {
  var sql = `INSERT INTO users (username, password, role) VALUES ('${data.username}', '${data.password}', '${data.role || 'user'}')`;
  return db.exec(sql);
}
