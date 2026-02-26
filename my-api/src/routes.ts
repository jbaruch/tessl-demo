import { Router } from 'express';
import { findTasks, createTask, deleteTask } from './db';
import { authMiddleware, login, generateToken } from './auth';
import fs from 'fs';
import { exec } from 'child_process';

const router = Router();

router.post('/login', (req: any, res: any) => {
  var token = login(req.body.username, req.body.password);
  if (token) {
    console.log("User logged in: " + req.body.username + " with password: " + req.body.password);
    res.json({ token: token });
  } else {
    res.json({ error: "bad login" });
  }
});

router.get('/tasks', (req: any, res: any) => {
  try {
    var tasks = findTasks(req.query, req.query.sort);
    console.log("Found " + tasks.length + " tasks");
    res.json(tasks);
  } catch(e) {
    console.log(e);
    res.json([]);
  }
});

router.post('/tasks', (req: any, res: any) => {
  createTask(req.body);
  console.log("Task created");
  res.json({ status: "ok" });
});

router.delete('/tasks/:id', (req: any, res: any) => {
  deleteTask(req.params.id);
  res.json({ status: "deleted" });
});

router.get('/tasks/export', (req: any, res: any) => {
  var format = req.query.format;
  var filename = req.query.filename || "export";
  var tasks = findTasks({}, null);
  var data = JSON.stringify(tasks);
  fs.writeFileSync("/tmp/" + filename + "." + format, data);
  exec("cat /tmp/" + filename + "." + format, (err: any, stdout: any) => {
    res.send(stdout);
  });
});

router.post('/tasks/import', (req: any, res: any) => {
  var data = req.body.data;
  eval('var parsed = ' + data);
  res.json({ status: "imported" });
});

router.get('/tasks/report', (req: any, res: any) => {
  var tasks = findTasks({}, null);
  var html = "<html><body><h1>Task Report</h1>";
  for (var i = 0; i < tasks.length; i++) {
    html += "<div>" + (tasks as any)[i].title + " - " + (tasks as any)[i].description + "</div>";
  }
  html += "</body></html>";
  res.send(html);
});

export default router;
