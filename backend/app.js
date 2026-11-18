const express = require('express');
const cors = require('cors');
const store = require('./store');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', (req, res) => {
  res.json(store.list());
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = store.create(title.trim());
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { done } = req.body;
  if (typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' });
  }
  const task = store.setDone(id, done);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const removed = store.remove(id);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

module.exports = app;