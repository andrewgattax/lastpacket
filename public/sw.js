// LastPacket Service Worker — High-Reliability Offline Telemetry PWA Cache
const CACHE_NAME = 'lastpacket-v3';
const TILE_CACHE_NAME = 'lastpacket-tiles-v1';

const STATIC_PRECACHE = [
  '/',
  '/viewer',
  '/manifest.webmanifest',
  '/example_log.csv',
  '/favicon.ico',
  '/icon.svg',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/screenshots/desktop-1.png',
  '/screenshots/mobile-1.png',
];

// 1x1 Transparent SVG placeholder for uncached map tiles when offline
const BLANK_TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#0d0e12" fill-opacity="0.9"/></svg>`;

// Fallback HTML page if cache is somehow missing during offline navigation
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LastPacket — Offline Mode</title>
  <style>
    body { background-color: #0a0a0c; color: #e4e4e7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
    .card { background: #141418; border: 1px solid #27272a; border-radius: 1rem; padding: 2.5rem; max-width: 440px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h1 { color: #eab308; font-size: 1.5rem; margin-top: 1rem; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
    .btn { display: inline-block; background: #eab308; color: #0a0a0c; font-weight: 600; padding: 0.65rem 1.5rem; border-radius: 0.5rem; text-decoration: none; border: none; cursor: pointer; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .icon { width: 48px; height: 48px; margin: 0 auto; stroke: #eab308; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  </style>
</head>
<body>
  <div class="card">
    <svg class="icon" viewBox="0 0 24 24"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
    <h1>You are currently offline</h1>
    <p>LastPacket telemetry viewer is ready. Connect once to ensure all assets are synchronized or reload the page.</p>
    <button class="btn" onclick="window.location.reload()">Reload Application</button>
  </div>
</body>
</html>`;

/**
 * Helper to cache a single URL safely without throwing
 */
async function cacheUrlSafely(cache, url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (res && (res.ok || res.type === 'opaque')) {
      await cache.put(url, res.clone());
      return res;
    }
  } catch (err) {
    console.warn(`[PWA SW] Pre-caching skipped for ${url}:`, err.message || err);
  }
  return null;
}

/**
 * Scan HTML text for Next.js static script and stylesheet links to precache them
 */
function extractNextStaticAssets(html) {
  const assets = new Set();
  if (!html) return assets;
  const regex = /["'](\/_next\/static\/[^"']+\.(?:js|css))["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    assets.add(match[1]);
  }
  return assets;
}

// Install Event: Cache all shell pages and their Next.js chunks
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const discoveredAssets = new Set();

      // Pre-cache core URLs individually (non-blocking)
      for (const url of STATIC_PRECACHE) {
        const response = await cacheUrlSafely(cache, url);
        // If it is an HTML page, inspect for referenced Next.js static assets
        if (response && (url === '/' || url === '/viewer')) {
          try {
            const html = await response.text();
            for (const assetUrl of extractNextStaticAssets(html)) {
              discoveredAssets.add(assetUrl);
            }
          } catch {
            // ignore HTML text read errors
          }
        }
      }

      // Pre-cache all discovered Next.js JS chunks and CSS files
      for (const assetUrl of discoveredAssets) {
        await cacheUrlSafely(cache, assetUrl);
      }

      // Activate immediately
      await self.skipWaiting();
    })()
  );
});

// Activate Event: Clear obsolete cache versions and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== TILE_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Message Event: Allow window to register dynamically loaded static chunks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_RESOURCES' && Array.isArray(event.data.resources)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        for (const url of event.data.resources) {
          await cacheUrlSafely(cache, url);
        }
      })
    );
  }
});

// Fetch Event: Multi-tier offline interception
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle standard GET requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Map & Satellite Tiles (/api/tiles/*)
  if (url.pathname.startsWith('/api/tiles/')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(TILE_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch {
          // Offline fallback
        }

        const cached = await caches.match(request);
        if (cached) return cached;

        // Return a valid blank 200 SVG tile so Leaflet doesn't throw 404 broken image errors
        return new Response(BLANK_TILE_SVG, {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      })()
    );
    return;
  }

  // 2. Next.js Static Chunks, CSS, Icons, Fonts, Screenshots: Cache-First
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.csv') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // If not in cache and offline, check by pathname alone
          const altMatch = await caches.match(url.pathname);
          if (altMatch) return altMatch;
          return new Response('Asset Unavailable Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // 3. Navigation Requests (HTML document loading / refresh / address bar entry)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // Try network with timeout so poor/offline connection fails fast to cache
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const networkResponse = await fetch(request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            cache.put(url.pathname, networkResponse.clone());
            return networkResponse;
          }
        } catch {
          // Network failed or timed out -> serve from cache
        }

        // Search cache for matching route
        const cache = await caches.open(CACHE_NAME);

        // A. Match exact request
        let cached = await cache.match(request);
        if (cached) return cached;

        // B. Match pathname (e.g. '/viewer' or '/')
        cached = await cache.match(url.pathname);
        if (cached) return cached;

        // C. Route-specific fallbacks
        if (url.pathname.startsWith('/viewer')) {
          const viewerCached = await cache.match('/viewer');
          if (viewerCached) return viewerCached;
        }

        // D. Fallback to homepage shell
        const homeCached = await cache.match('/');
        if (homeCached) return homeCached;

        // E. Ultimate safeguard: return inline offline fallback HTML (prevents DNS_PROBE_STARTED)
        return new Response(OFFLINE_FALLBACK_HTML, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      })()
    );
    return;
  }

  // 4. Next.js RSC payload requests (client-side route prefetching / transitions)
  const isRSC =
    request.headers.get('RSC') === '1' ||
    url.searchParams.has('_rsc') ||
    request.headers.get('Next-Router-State-Tree');

  if (isRSC) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res && res.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, res.clone());
            return res;
          }
        } catch {
          // offline
        }

        const cached = await caches.match(request);
        if (cached) return cached;

        // Return empty RSC response to force Next.js client router to do full navigation (which SW catches)
        return new Response('', {
          status: 200,
          headers: { 'Content-Type': 'text/x-component' },
        });
      })()
    );
    return;
  }

  // 5. Stale-While-Revalidate for everything else
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);

      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })()
  );
});
