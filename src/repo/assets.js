import { readFileSync } from 'node:fs';

export function createAssetRepository() {
  // Read only known assets once at startup; request paths never become filesystem paths.
  const assets = new Map([
    ['index.html', {
      type: 'text/html; charset=utf-8',
      body: readFileSync(new URL('../../public/index.html', import.meta.url)),
    }],
    ['styles.css', {
      type: 'text/css; charset=utf-8',
      body: readFileSync(new URL('../../public/styles.css', import.meta.url)),
    }],
  ]);

  return {
    getAsset(name) {
      return assets.get(name);
    },
  };
}
