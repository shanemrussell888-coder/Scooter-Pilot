const CACHE_VERSION = 'v1';
const APP_CACHE = `scooternav-app-${CACHE_VERSION}`;
const TILE_CACHE = `scooternav-tiles-${CACHE_VERSION}`;
const MAX_TILE_CACHE_ENTRIES = 2000;

const APP_SHELL = [
  '/',
  '/src/main.tsx',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];

// Tile URL pattern (OpenStreetMap / CartoCDN)
const TILE_PATTERNS = [
  /https:\/\/[a-z]\.basemaps\.cartocdn\.com\//,
  /https:\/\/[a-z]\.tile\.openstreetmap\.org\//,
];

function isTileRequest(url) {
  return TILE_PATTERNS.some((re) => re.test(url));
}

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// Activate: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== APP_CACHE && k !== TILE_CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for tiles, network-first for app
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  if (isTileRequest(url)) {
    event.respondWith(tileStrategy(request));
    return;
  }

  if (request.method !== 'GET') return;

  if (url.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request, APP_CACHE));
});

async function tileStrategy(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      await limitedCachePut(cache, request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function limitedCachePut(cache, request, response) {
  const keys = await cache.keys();
  if (keys.length >= MAX_TILE_CACHE_ENTRIES) {
    await cache.delete(keys[0]);
  }
  await cache.put(request, response);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(APP_CACHE);
    const cached = await cache.match(request);
    return cached || new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

// Message: manual region pre-caching
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_REGION') {
    const { tiles } = event.data;
    event.waitUntil(
      caches.open(TILE_CACHE).then(async (cache) => {
        let cached = 0;
        for (const url of tiles) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              cached++;
            }
          } catch {}
          if (event.source) {
            event.source.postMessage({ type: 'CACHE_PROGRESS', cached, total: tiles.length });
          }
        }
        if (event.source) {
          event.source.postMessage({ type: 'CACHE_COMPLETE', cached, total: tiles.length });
        }
      })
    );
  }

  if (event.data?.type === 'CLEAR_TILE_CACHE') {
    event.waitUntil(
      caches.delete(TILE_CACHE).then(() => {
        if (event.source) event.source.postMessage({ type: 'CACHE_CLEARED' });
      })
    );
  }

  if (event.data?.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.open(TILE_CACHE).then(async (cache) => {
        const keys = await cache.keys();
        if (event.source) event.source.postMessage({ type: 'CACHE_SIZE', count: keys.length });
      })
    );
  }
});
