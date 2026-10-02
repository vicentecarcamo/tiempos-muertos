/* Ayudante de servicio del Registro de Tiempos Muertos.
   Guarda la página en el teléfono para que funcione sin señal.
   Sube este archivo junto a index.html, en la misma carpeta. */

const CACHE = 'tiempos-muertos-v1';
const ARCHIVOS = ['./', './index.html'];

/* Al instalarse, guarda la página */
self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

/* Al activarse, borra versiones anteriores */
self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primero intenta la red, para traer la versión más nueva cuando hay señal.
   Si no hay, entrega la copia guardada. */
self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;

  ev.respondWith(
    fetch(ev.request)
      .then((resp) => {
        if (resp && resp.ok && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(ev.request, copia)).catch(() => {});
        }
        return resp;
      })
      .catch(() =>
        caches.match(ev.request).then((hit) => hit || caches.match('./index.html'))
      )
  );
});
