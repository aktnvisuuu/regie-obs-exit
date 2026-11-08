import asyncio
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
WRAP="""window.FAIL=true;const R=window.WebSocket;window.WebSocket=function(u){if(window.FAIL){const o={readyState:0,send(){},close(){}};setTimeout(()=>{o.onerror&&o.onerror({});o.onclose&&o.onclose({code:1006})},200);return o}return new R(u)};"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 15 Pro'])
    await c.add_init_script(path='fake2.js');await c.add_init_script(WRAP);await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama'}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('file://'+__import__('os').path.abspath('index.html')+'');await pg.wait_for_timeout(2500)
    ok(await pg.is_visible('#powB'),'Serveur éteint → bouton « Allumer le serveur »')
    ok(await pg.get_attribute('#powB','href')=='https://irl.run','Le bouton ouvre irl.run')
    await pg.screenshot(path='t18.png',clip={'x':0,'y':0,'width':393,'height':560})
    await pg.evaluate("document.getElementById('powB').addEventListener('click',e=>e.preventDefault(),{capture:true})")
    await pg.click('#powB');await pg.wait_for_timeout(300)
    ok('Démarrage' in await pg.inner_text('#powT'),'Message « Démarrage en cours »')
    await pg.evaluate("window.FAIL=false");await pg.wait_for_timeout(6000)
    ok(await pg.evaluate('S.ok') and not await pg.evaluate("document.getElementById('power').classList.contains('on')"),'Serveur prêt → Régie connectée seule, bouton disparu')
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
