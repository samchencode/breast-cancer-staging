import { createHash } from 'node:crypto';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const cacheableFilePattern = /\.(?:css|html|ico|js|json|png|svg|ttf|webp|woff2?)$/i;

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const filePath = join(dir, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      return listFiles(filePath);
    }

    return filePath;
  });
}

const precacheUrls = listFiles(distDir)
  .map((filePath) => relative(distDir, filePath).split(sep).join('/'))
  .filter((filePath) => filePath !== 'sw.js' && cacheableFilePattern.test(filePath))
  .sort()
  .map((filePath) => './' + filePath);

const cacheHash = createHash('sha256').update(precacheUrls.join('\n')).digest('hex').slice(0, 12);

const serviceWorker = [
  "const CACHE_VERSION = 'breast-cancer-staging-" + cacheHash + "';",
  "const APP_SHELL = './index.html';",
  'const PRECACHE_URLS = ' + JSON.stringify(precacheUrls, null, 2) + ';',
  '',
  "self.addEventListener('install', (event) => {",
  '  event.waitUntil(',
  '    caches',
  '      .open(CACHE_VERSION)',
  '      .then((cache) => cache.addAll(PRECACHE_URLS))',
  '      .then(() => self.skipWaiting())',
  '  );',
  '});',
  '',
  "self.addEventListener('activate', (event) => {",
  '  event.waitUntil(',
  '    caches',
  '      .keys()',
  "      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))",
  '      .then(() => self.clients.claim())',
  '  );',
  '});',
  '',
  "self.addEventListener('fetch', (event) => {",
  '  const { request } = event;',
  '',
  "  if (request.method !== 'GET') {",
  '    return;',
  '  }',
  '',
  '  const url = new URL(request.url);',
  '',
  '  if (url.origin !== self.location.origin) {',
  '    return;',
  '  }',
  '',
  "  if (request.mode === 'navigate') {",
  '    event.respondWith(networkFirst(request, APP_SHELL));',
  '    return;',
  '  }',
  '',
  '  event.respondWith(cacheFirst(request));',
  '});',
  '',
  'async function networkFirst(request, fallbackUrl) {',
  '  const cache = await caches.open(CACHE_VERSION);',
  '',
  '  try {',
  '    const response = await fetch(request);',
  '    cache.put(request, response.clone());',
  '    return response;',
  '  } catch {',
  '    return (await cache.match(request)) || cache.match(fallbackUrl);',
  '  }',
  '}',
  '',
  'async function cacheFirst(request) {',
  '  const cache = await caches.open(CACHE_VERSION);',
  '  const cachedResponse = await cache.match(request);',
  '',
  '  if (cachedResponse) {',
  '    return cachedResponse;',
  '  }',
  '',
  '  const response = await fetch(request);',
  '',
  '  if (response.ok) {',
  '    cache.put(request, response.clone());',
  '  }',
  '',
  '  return response;',
  '}',
].join('\n') + '\n';

writeFileSync(join(distDir, 'sw.js'), serviceWorker);
