// Service Worker - IFRO Campus Cacoal
// Mude o número abaixo toda vez que fizer alterações no site
const CACHE_VERSION = 'ifro-v2';

const ARQUIVOS_CACHE = [
  '/horariosemanal/',
  '/horariosemanal/index.html',
  '/horariosemanal/manifest.json',
  '/horariosemanal/icons/icon-192.png',
  '/horariosemanal/icons/icon-512.png'
];

// Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: remove caches antigos e assume controle imediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Avisa todas as abas abertas para recarregar
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ tipo: 'ATUALIZAR' });
        });
      });
    })
  );
});

// Fetch: rede primeiro, cache como fallback
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('docs.google.com') ||
      event.request.url.includes('spreadsheets')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
