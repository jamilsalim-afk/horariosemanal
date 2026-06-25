// Service Worker - IFRO Campus Cacoal
// Versão do cache - atualize este número sempre que fizer mudanças no site
const CACHE_VERSION = 'ifro-v1';

const ARQUIVOS_CACHE = [
  '/horariosemanal/',
  '/horariosemanal/index.html',
  '/horariosemanal/manifest.json',
  '/horariosemanal/icons/icon-192.png',
  '/horariosemanal/icons/icon-512.png'
];

// Instalação: salva os arquivos principais no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições: tenta rede primeiro, fallback para cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições ao Google Sheets (sempre precisa de rede)
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('docs.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Salva cópia nova no cache se a requisição teve sucesso
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se não tem internet, usa o cache
        return caches.match(event.request);
      })
  );
});
