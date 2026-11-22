import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';

const serverPath = new URL('../src/server/index.js', import.meta.url);

test('application serves its HTTP contract on 0.0.0.0 with an assigned PORT', async (t) => {
  const child = spawn(process.execPath, [serverPath.pathname], {
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(child, 'exit');
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await exited;
  });

  let output = '';
  child.stdout.setEncoding('utf8').on('data', (data) => { output += data; });
  child.stderr.setEncoding('utf8').on('data', (data) => { output += data; });
  let match;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    match = output.match(/listening on 0\.0\.0\.0:(\d+)/);
    if (match || child.exitCode !== null) break;
    await delay(50);
  }
  assert.ok(match, `Server did not start: ${output}`);
  const base = `http://127.0.0.1:${match[1]}`;

  await t.test('home page and its local stylesheet respond successfully', async () => {
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^text\/html/);
    const html = await response.text();
    assert.match(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '), /Cloud Lab is running/);
    assert.match(html, /CloudRes Lab/);
    assert.match(html, /name="viewport"/);
    const css = await fetch(`${base}/styles.css`);
    assert.equal(css.status, 200);
    assert.match(css.headers.get('content-type'), /^text\/css/);
    assert.ok((await css.text()).length > 0);
  });

  await t.test('health returns uncached JSON, including with a query string', async () => {
    for (const path of ['/health', '/health?probe=local']) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^application\/json/);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { status: 'ok' });
    }
  });

  await t.test('HEAD returns headers without a response body', async () => {
    for (const path of ['/', '/styles.css', '/health']) {
      const response = await fetch(`${base}${path}`, { method: 'HEAD' });
      assert.equal(response.status, 200);
      assert.equal(await response.text(), '');
      assert.ok(Number(response.headers.get('content-length')) > 0);
    }
  });

  await t.test('unknown and sensitive paths are unavailable', async () => {
    for (const path of ['/missing', '/.env', '/src/server/index.js', '/src/repo/assets.js', '/package.json', '/%2e%2e/README.md']) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 404);
    }
  });

  await t.test('unsupported methods cannot report a successful health response', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
      const response = await fetch(`${base}/health`, { method });
      assert.equal(response.status, 405);
      assert.equal(response.headers.get('allow'), 'GET, HEAD');
    }
  });
});

test('invalid PORT values fail startup with a useful message', () => {
  for (const port of ['', '-1', '65536', '3000.5', 'abc', ' 3000']) {
    const result = spawnSync(process.execPath, [serverPath.pathname], {
      env: { ...process.env, PORT: port },
      encoding: 'utf8',
      timeout: 5000,
    });
    assert.equal(result.status, 1, `PORT=${JSON.stringify(port)}`);
    assert.match(result.stderr, /PORT must be a whole number/);
  }
});
