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
const VERSION = 'heritage-khalam-v3.10.0';
const CACHE = 'khalam-' + VERSION;

const A_PRECHARGER = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "main.js",
  "site.css",
  "state.js",
  "story.js",
  "audio.js",
  "ui.js",
  "pillars.js",
  "config.js",
  "voice.js",
  "anim.js",
  "cinematique.js",
  "icon-192.png",
  "icon-512.png",
  "character-didi-avatar.webp",
  "character-didi.webp",
  "character-mila-avatar.webp",
  "character-mila.webp",
  "decor-bureau-dakar.webp",
  "decor-bureau.webp",
  "decor-gala.webp",
  "decor-maison.webp",
  "decor-mer.webp",
  "decor-promenade.webp",
  "decor-quartier.webp",
  "decor-restaurant.webp",
  "decor-village.webp",
  "didi-palier-1.webp",
  "didi-palier-2.webp",
  "didi-palier-3.webp",
  "didi-palier-4.webp",
  "didi-palier-5.webp",
  "didi-soiree.webp",
  "didi-marche-1.webp",
  "didi-marche-2.webp",
  "didi-assise.webp",
  "home-background.webp",
  "mila-palier-1.webp",
  "mila-palier-2.webp",
  "mila-palier-3.webp",
  "mila-palier-4.webp",
  "mila-palier-5.webp",
  "mila-soiree.webp",
  "mila-marche-1.webp",
  "mila-marche-2.webp",
  "mila-assis.webp",
  "mila-sport.webp",
  "official-game-emblem.webp",
  "scene-demande-1-hall.webp",
  "scene-demande-2-corniche.webp",
  "scene-demande-3-entree.webp",
  "scene-demande-4-table.webp",
  "decor-table-nappe.webp",
  "couple-marche-1.webp",
  "couple-marche-2.webp",
  "scene-demande-5-ecrin.webp",
  "scene-demande-6-aube.webp",
  "ambient-theme.mp3",
  "ui-click.mp3"
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
