/* Service worker: guarda la app para abrir rápido; los datos siempre se piden en línea. */
const CACHE="compras-agd-v07388e3dc3";
const BASE=["./", "index.html", "gerencia.html", "bandeja.html", "checklist.html", "control.html", "whatsapp.html", "proveedores.html", "etapas.js", "comun.js", "guia.js", "firebase_config.js", "nube.js", "marco.css", "manifest.webmanifest", "iconos/icono-192.png", "iconos/icono-512.png", "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js", "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.hostname.endsWith("supabase.co")||u.hostname.includes("firestore.googleapis.com")||u.hostname.includes("identitytoolkit.googleapis.com")||u.hostname.includes("securetoken.googleapis.com")) return;
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok&&(u.origin===location.origin||u.hostname.endsWith("jsdelivr.net")||u.hostname.endsWith("cloudflare.com")||u.hostname.endsWith("googleapis.com")||u.hostname.endsWith("gstatic.com"))){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));} return r; })
    .catch(()=>caches.match(e.request)));
});
