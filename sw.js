/**
 * sw.js — Service worker d'ÉQUILIBRE — L'Héritage des Khalam.
 *
 * Stratégie :
 *  - HTML et modules JS : réseau d'abord, cache en secours. Une mise à jour
 *    déployée est ainsi prise en compte dès la connexion suivante, sans que
 *    le joueur ait à vider quoi que ce soit.
 *  - Images, sons, styles : cache d'abord, pour un démarrage instantané et un
 *    fonctionnement hors ligne.
 *
 * VERSION doit être incrémentée à chaque livraison, en même temps que
 * BUILD_TAG dans main.js : c'est ce changement qui purge l'ancien cache.
 */
const VERSION = 'heritage-khalam-v2.4.1';
const CACHE = 'khalam-' + VERSION;

const A_PRECHARGER = [
  "./",
  "ambient-theme.mp3",
  "audio.js",
  "character-didi-avatar.webp",
  "character-didi.webp",
  "character-mila-avatar.webp",
  "character-mila.webp",
  "config.js",
  "home-background.webp",
  "icon-192.png",
  "icon-512-maskable.png",
  "icon-512.png",
  "index.html",
  "main.js",
  "manifest.webmanifest",
  "official-game-emblem.webp",
  "pillars.js",
  "scene-destiny-summit-african-webp.webp",
  "scene-legacy-final-webp.webp",
  "scene-renaissance-african-webp.webp",
  "scene-transmission-african-webp.webp",
  "site.css",
  "state.js",
  "story.js",
  "ui-click.mp3",
  "ui.js"
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(
        A_PRECHARGER.map((u) => c.add(new Request(u, { cache: 'reload' })))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Le code doit refléter le dernier déploiement : réseau d'abord. */
function reseauDAbord(req) {
  return fetch(req)
    .then((r) => {
      if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone()));
      return r;
    })
    .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')));
}

/** Les ressources ne changent pas d'un déploiement à l'autre : cache d'abord. */
function cacheDAbord(req) {
  return caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok && new URL(req.url).origin === location.origin) {
      caches.open(CACHE).then((c) => c.put(req, r.clone()));
    }
    return r;
  }));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const estCode = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html')
    || url.pathname.endsWith('.js');

  e.respondWith(estCode ? reseauDAbord(req) : cacheDAbord(req));
});
