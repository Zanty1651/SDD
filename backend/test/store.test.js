const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const store = require('../store');

describe('store', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('list', () => {
    it('should return empty array initially', () => {
      assert.deepStrictEqual(store.list(), []);
    });

    it('should return all tasks', () => {
      store.create('Task 1');
      store.create('Task 2');
      const tasks = store.list();
      assert.strictEqual(tasks.length, 2);
      assert.strictEqual(tasks[0].title, 'Task 1');
      assert.strictEqual(tasks[1].title, 'Task 2');
    });

    it('should return a copy, not the original array', () => {
      store.create('Task 1');
      const tasks = store.list();
      tasks.push({ id: 999, title: 'Hacked', done: false });
      assert.strictEqual(store.list().length, 1);
    });
  });

  describe('create', () => {
    it('should create a task with id, title, and done=false', () => {
      const task = store.create('New task');
      assert.strictEqual(task.id, 1);
      assert.strictEqual(task.title, 'New task');
      assert.strictEqual(task.done, false);
    });

    it('should increment id for each task', () => {
      store.create('Task 1');
      const task2 = store.create('Task 2');
      assert.strictEqual(task2.id, 2);
    });

    it('should add task to list', () => {
      store.create('Task 1');
      assert.strictEqual(store.list().length, 1);
    });
  });

  describe('setDone', () => {
    it('should update done status', () => {
      const task = store.create('Task 1');
      const updated = store.setDone(task.id, true);
      assert.strictEqual(updated.done, true);
    });

    it('should return null for non-existent id', () => {
      const result = store.setDone(999, true);
      assert.strictEqual(result, null);
    });

    it('should persist the change in the list', () => {
      const task = store.create('Task 1');
      store.setDone(task.id, true);
      const tasks = store.list();
      assert.strictEqual(tasks[0].done, true);
    });
  });

  describe('remove', () => {
    it('should remove existing task', () => {
      const task = store.create('Task 1');
      const result = store.remove(task.id);
      assert.strictEqual(result, true);
      assert.strictEqual(store.list().length, 0);
    });

    it('should return false for non-existent id', () => {
      const result = store.remove(999);
      assert.strictEqual(result, false);
    });
  });

  describe('reset', () => {
    it('should clear all tasks and reset id counter', () => {
      store.create('Task 1');
      store.create('Task 2');
      store.reset();
      assert.deepStrictEqual(store.list(), []);
      const task = store.create('Task 3');
      assert.strictEqual(task.id, 1);
    });
  });
});