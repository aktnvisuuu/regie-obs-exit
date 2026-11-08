# L'app s'ouvre même sans réseau (service worker)
import asyncio
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 15 Pro'])
    await c.add_init_script(path='fake2.js');await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama'}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(2500)
    ok(await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!(r&&r.active))"),'Page gardée sur le téléphone (service worker actif)')
    await pg.reload();await pg.wait_for_timeout(1500)
    await c.set_offline(True)
    await pg.reload();await pg.wait_for_timeout(2500)
    ok(await pg.evaluate("!!document.getElementById('v-regie')") and await pg.evaluate("S.ok"),'Sans réseau : la Régie s’ouvre quand même')
    await c.set_offline(False)
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
