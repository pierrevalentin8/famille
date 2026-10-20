const CACHE='famille-static-v3-flat';
const base=new URL('./',self.location.href);
const offline=new URL('offline.html',base).href;
const staticFiles=['offline.html','icon-180.png','icon-192.png','icon-512.png','logo-famille-transparent.png'].map(p=>new URL(p,base).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(staticFiles.map(async url=>{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response)}))))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('famille-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==base.origin||url.pathname.includes('/api/')||url.pathname.includes('/signin')||url.pathname.includes('/signout')||url.pathname.includes('/callback'))return;
if(request.mode==='navigate'){event.respondWith(fetch(request).catch(async()=>await caches.match(offline)||new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Famille</title><h1>Famille</h1><p>Reconnectez-vous à Internet pour retrouver votre espace.</p></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}})));return}
if(staticFiles.includes(url.href)){event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));}
});
