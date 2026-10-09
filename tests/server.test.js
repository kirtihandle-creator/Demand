const test = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const Store = require('../src/services/store');
const { createServer } = require('../src/server');

let server;
let base;

test.before(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shortie-http-'));
  const store = new Store(path.join(dir, 'links.json'));
  server = createServer({ store, baseUrl: 'http://localhost' });
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

test('POST /api/shorten creates a link', async () => {
  const res = await fetch(`${base}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.match(body.code, /^[A-Za-z0-9]{6}$/);
  assert.equal(body.shortUrl, `http://localhost/${body.code}`);
});

test('GET /:code redirects and counts a hit', async () => {
  const created = await fetch(`${base}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.org/page' }),
  }).then((r) => r.json());

  const res = await fetch(`${base}/${created.code}`, { redirect: 'manual' });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://example.org/page');

  const stats = await fetch(`${base}/api/stats/${created.code}`).then((r) => r.json());
  assert.equal(stats.hits, 1);
});

test('rejects invalid URL and invalid JSON', async () => {
  const bad = await fetch(`${base}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'ftp://nope' }),
  });
  assert.equal(bad.status, 400);

  const broken = await fetch(`${base}/api/shorten`, { method: 'POST', body: '{not json' });
  assert.equal(broken.status, 400);
});

test('unknown code returns 404', async () => {
  const res = await fetch(`${base}/zzzzzz`, { redirect: 'manual' });
  assert.equal(res.status, 404);
});
