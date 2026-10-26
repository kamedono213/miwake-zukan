// 自動生成(tools/build-pages.js)。手で編集しない。
const CACHE = 'mz-7f21f2b4b2';
const PRECACHE = ["./","app.js","data.js","furi.js","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","img/map/01.png","img/map/02.png","img/map/03.png","img/map/04.png","img/map/05.png","img/map/06.png","img/map/07.png","img/map/08.png","img/map/09.png","img/map/10.png","img/map/11.png","img/map/12.png","img/map/13.png","img/map/14.png","img/map/15.png","img/map/16.png","img/map/17.png","img/map/18.png","img/map/19.png","img/map/20.png","img/map/21.png","img/map/22.png","img/map/23.png","img/map/24.png","img/map/25.png","img/map/26.png","img/map/27.png","img/map/28.png","img/map/29.png","img/map/30.png","img/map/31.png","img/map/32.png","img/map/33.png","img/map/34.png","img/map/35.png","img/map/36.png","img/map/37.png","img/map/38.png","img/map/39.png","img/road/01.png","img/road/02.png","img/road/03.png","img/road/04.png","img/road/05.png","img/road/06.png","img/road/07.png","img/road/08.png","img/road/09.png","img/road/10.png","img/road/11.png","img/road/12.png","img/road/13.png","img/road/14.png","img/road/15.png","img/road/16.png","img/road/17.png","img/road/18.png","img/road/19.png","img/road/20.png","img/road/21.png","img/road/22.png","img/road/23.png","img/road/24.png","img/road/25.png","img/road/26.png","img/road/27.png","img/road/28.png","img/road/29.png","img/road/30.png","img/road/31.png","img/road/32.png","img/road/33.png","img/road/34.png","img/road/35.png","img/road/36.png","img/road/37.png","img/road/38.png","img/road/39.png","img/road/40.png","img/road/41.png","img/road/42.png","img/road/43.png","img/road/44.png","img/road/45.png","img/road/46.png","img/road/47.png","img/road/48.png","img/road/49.png","img/road/50.png","img/road/51.png","img/road/52.png","img/road/53.png","img/road/54.png","img/stone/01.jpg","img/stone/02.jpg","img/stone/03.jpg","img/stone/04.jpg","img/stone/05.jpg","img/stone/06.jpg","img/stone/07.jpg","img/stone/08.jpg","img/stone/09.jpg","img/stone/10.jpg","img/stone/11.jpg","img/stone/12.jpg","img/stone/13.jpg","img/stone/14.jpg","img/stone/15.jpg","img/stone/16.jpg","img/stone/17.jpg","img/stone/18.jpg","img/stone/19.jpg","img/stone/20.jpg","img/stone/21.jpg","img/stone/22.jpg","img/stone/23.jpg","img/stone/24.jpg","img/stone/25.jpg","img/stone/26.jpg","img/stone/27.jpg","img/stone/28.jpg","img/stone/29.jpg","img/stone/30.jpg","img/stone/31.jpg","img/stone/32.jpg","img/stone/33.jpg","img/stone/34.jpg","img/stone/35.jpg","img/stone/36.jpg","img/stone/37.jpg","img/stone/38.jpg","manifest.webmanifest"];
const LIBS = [];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.concat(LIBS))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mz-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Google Fonts は使うたびに保存(オフラインでは代わりの書体で表示)
  const isFont = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    if (hit) return hit;
    return fetch(e.request).then(res => {
      if (res.ok && (isFont || url.origin === location.origin)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('./') : Response.error());
  }));
});
