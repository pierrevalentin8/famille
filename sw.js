const CACHE='famille-static-v8-family-sharing';
const base=new URL('./',self.location.href);
const offline=new URL('offline.html',base).href;
const configPath=new URL('firebase-config.js',base).pathname;
const staticFiles=['offline.html','icon-180.png','icon-192.png','icon-512.png','logo-famille-transparent.png'].map(p=>new URL(p,base).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(staticFiles.map(async url=>{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response)}))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('famille-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==base.origin)return;
if(url.pathname===configPath){const fresh=new URL(url);fresh.searchParams.set('_famille_config',String(Date.now()));event.respondWith(fetch(fresh.href,{cache:'no-store',credentials:'same-origin'}));return}
if(url.pathname.includes('/api/')||url.pathname.includes('/signin')||url.pathname.includes('/signout')||url.pathname.includes('/callback'))return;
if(request.mode==='navigate'){event.respondWith(fetch(request,{cache:'no-store'}).catch(async()=>await caches.match(offline)||new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Famille</title><h1>Famille</h1><p>Reconnectez-vous à Internet pour retrouver votre espace.</p></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}})));return}
if(staticFiles.includes(url.href)){event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));}
});
