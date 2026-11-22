import { HttpError } from './http-error.js';

export function handleError(error, request, response) {
  const expected = error instanceof HttpError;
  const statusCode = expected ? error.statusCode : 500;
  const message = expected ? error.message : 'Internal server error';

  if (!expected) {
    console.error('Request failed:', error);
  }

  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...(expected ? error.headers : {}),
  });
  response.end(request.method === 'HEAD' ? undefined : `${message}\n`);
}
