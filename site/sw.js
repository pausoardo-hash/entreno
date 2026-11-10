/* Entreno · service worker
   - La página (index.html) se busca primero en la red, así las actualizaciones llegan solas;
     si no hay conexión, se usa la copia guardada.
   - Fuentes e íconos: primero caché.
   VERSION la reemplaza GitHub Actions en cada publicación. */
const VERSION = "__VERSION__";
const CACHE = "entreno-" + VERSION;
const ARCHIVOS = [
  "./",
  "./index.html",
  "./respaldo.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./fonts/manrope-latin-400-normal.woff2",
  "./fonts/manrope-latin-500-normal.woff2",
  "./fonts/manrope-latin-600-normal.woff2",
  "./fonts/manrope-latin-700-normal.woff2",
  "./fonts/manrope-latin-800-normal.woff2",
  "./fonts/geist-mono-latin-200-normal.woff2",
  "./fonts/geist-mono-latin-300-normal.woff2",
  "./fonts/geist-mono-latin-400-normal.woff2",
  "./fonts/geist-mono-latin-500-normal.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("entreno-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const esPagina = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html") || url.pathname.endsWith(".js");
  if (esPagina) {
    e.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((r) => r || fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    }))
  );
});
