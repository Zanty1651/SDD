const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');
const store = require('../store');

let server;

describe('API /api/tasks', () => {
  before(() => {
    server = app.listen(0);
  });

  after(() => {
    server.close();
  });

  beforeEach(() => {
    store.reset();
  });

  describe('GET /api/tasks', () => {
    it('should return empty array initially', async () => {
      const response = await request(server).get('/api/tasks');
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.body, []);
    });

    it('should return all tasks', async () => {
      store.create('Task 1');
      store.create('Task 2');
      const response = await request(server).get('/api/tasks');
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 2);
      assert.strictEqual(response.body[0].title, 'Task 1');
      assert.strictEqual(response.body[1].title, 'Task 2');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task and return 201', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .send({ title: 'New task' });
      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.title, 'New task');
      assert.strictEqual(response.body.done, false);
      assert.strictEqual(typeof response.body.id, 'number');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .send({ title: '' });
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, 'Title is required');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .send({});
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, 'Title is required');
    });

    it('should return 400 for whitespace-only title', async () => {
      const response = await request(server)
        .post('/api/tasks')
        .send({ title: '   ' });
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, 'Title is required');
    });

    it('should persist task in store', async () => {
      await request(server)
        .post('/api/tasks')
        .send({ title: 'Persisted task' });
      const tasks = store.list();
      assert.strictEqual(tasks.length, 1);
      assert.strictEqual(tasks[0].title, 'Persisted task');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update done status and return updated task', async () => {
      const created = store.create('Task to update');
      const response = await request(server)
        .patch(`/api/tasks/${created.id}`)
        .send({ done: true });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.id, created.id);
      assert.strictEqual(response.body.done, true);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(server)
        .patch('/api/tasks/999')
        .send({ done: true });
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.error, 'Task not found');
    });

    it('should return 400 if done is not a boolean', async () => {
      const created = store.create('Task');
      const response = await request(server)
        .patch(`/api/tasks/${created.id}`)
        .send({ done: 'true' });
      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, 'done must be a boolean');
    });

    it('should persist the change in store', async () => {
      const created = store.create('Task');
      await request(server)
        .patch(`/api/tasks/${created.id}`)
        .send({ done: true });
      const tasks = store.list();
      assert.strictEqual(tasks[0].done, true);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task and return 204', async () => {
      const created = store.create('Task to delete');
      const response = await request(server)
        .delete(`/api/tasks/${created.id}`);
      assert.strictEqual(response.status, 204);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(server)
        .delete('/api/tasks/999');
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.error, 'Task not found');
    });

    it('should remove task from store', async () => {
      const created = store.create('Task to delete');
      await request(server)
        .delete(`/api/tasks/${created.id}`);
      const tasks = store.list();
      assert.strictEqual(tasks.length, 0);
    });
  });
});