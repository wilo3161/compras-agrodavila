/* Service worker: guarda la app para abrir rápido; los datos siempre se piden en línea. */
const CACHE="compras-agd-ve9b0a1432d";
const BASE=["./","index.html","control.html","whatsapp.html","comun.js","marco.css","manifest.webmanifest","iconos/icono-192.png","iconos/icono-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.hostname.endsWith("supabase.co")) return;
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok&&(u.origin===location.origin||u.hostname.endsWith("jsdelivr.net")||u.hostname.endsWith("cloudflare.com"))){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));} return r; })
    .catch(()=>caches.match(e.request)));
});
