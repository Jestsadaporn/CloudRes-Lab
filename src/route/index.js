import { HttpError } from '../error/http-error.js';

export function createRouter(assets) {
  const routes = new Map([
    ['/', () => assets.getAsset('index.html')],
    ['/styles.css', () => assets.getAsset('styles.css')],
    ['/health', () => ({
      type: 'application/json; charset=utf-8',
      body: Buffer.from('{"status":"ok"}'),
    })],
  ]);

  return (request, response) => {
    let pathname;
    try {
      pathname = new URL(request.url, 'http://localhost').pathname;
    } catch {
      throw new HttpError(400, 'Bad request');
    }

    const handler = routes.get(pathname);
    if (!handler) {
      throw new HttpError(404, 'Not found');
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      throw new HttpError(405, 'Method not allowed', { Allow: 'GET, HEAD' });
    }

    const resource = handler();
    response.writeHead(200, {
      'Content-Type': resource.type,
      'Content-Length': resource.body.length,
    });
    response.end(request.method === 'HEAD' ? undefined : resource.body);
  };
}
