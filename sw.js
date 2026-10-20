const CACHE='famille-static-v1';
const base=new URL('./',self.location.href);
const offline=new URL('offline.html',base).href;
const staticFiles=['offline.html','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','logo-famille-transparent.png'].map(p=>new URL(p,base).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(staticFiles)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('famille-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==base.origin||url.pathname.includes('/api/')||url.pathname.includes('/signin')||url.pathname.includes('/signout')||url.pathname.includes('/callback'))return;
if(request.mode==='navigate'){event.respondWith(fetch(request).catch(()=>caches.match(offline)));return}
if(staticFiles.includes(url.href)){event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));}
});
