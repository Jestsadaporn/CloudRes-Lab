import { createServer } from 'node:http';
import { handleError } from '../error/handle-error.js';
import { applyResponseHeaders } from '../middleware/response-headers.js';
import { createAssetRepository } from '../repo/assets.js';
import { createRouter } from '../route/index.js';

export function createAppServer() {
  const assets = createAssetRepository();
  const route = createRouter(assets);

  return createServer((request, response) => {
    applyResponseHeaders(response);

    try {
      route(request, response);
    } catch (error) {
      handleError(error, request, response);
    }
  });
}
