const CACHE_NAME = 'coherence-cardiaque-v1.0.8-fix-sfx-alternance-v13';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json'
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🔄 Toujours récupérer les nouveaux fichiers audio / manifest (sinon iOS garde l'ancienne liste)
  // - audio-manifest.json doit refléter les nouveaux fichiers déposés
  // - les fichiers dans /music et /sounds peuvent changer
  if (
    url.pathname.endsWith('/assets/audio-manifest.json') ||
    url.pathname.includes('/music/') ||
    url.pathname.includes('/sounds/')
  ) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('./index.html');
        });
      })
  );
});
