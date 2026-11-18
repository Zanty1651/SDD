const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

let server;

describe('GET /api/health', () => {
  before(() => {
    server = app.listen(0);
  });

  after(() => {
    server.close();
  });

  it('should return 200 and { status: "ok" }', async () => {
    const response = await request(server).get('/api/health');
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, { status: 'ok' });
  });
});