/* Régie EXIT · garde la page sur le téléphone pour qu'elle s'ouvre même quand le réseau rame.
   Page : réseau d'abord (3 s max), sinon la dernière version gardée. Icônes : cache d'abord.
   Les vérifications de mise à jour (?v=…) passent toujours par le réseau. */
const C='regie-exit-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','logo.png','icon.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  if(u.searchParams.has('v')&&r.mode!=='navigate')return;                 // vérification de mise à jour
  if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
    e.respondWith((async()=>{
      const c=await caches.open(C);
      try{
        const net=await Promise.race([fetch(r,{cache:'no-store'}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('lent')),3000))]);
        if(net&&net.ok)c.put('./',net.clone());
        return net;
      }catch(err){
        const hit=await c.match('./');if(hit)return hit;
        return fetch(r);
      }
    })());
    return;
  }
  if(/\.(png|jpg|svg|ico)$/.test(u.pathname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})));
  }
});
