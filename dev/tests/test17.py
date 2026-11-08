import asyncio
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    c=await b.new_context(**p.devices['iPhone 15 Pro']);await c.add_init_script(path='fake2.js');await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama'}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('file://'+__import__('os').path.abspath('index.html')+'');await pg.wait_for_timeout(3000)
    nav=await pg.evaluate("[...document.querySelectorAll('nav button')].map(b=>b.textContent)")
    ok(nav==['Scènes','Son'],'Onglets : '+str(nav))
    txt=await pg.evaluate("document.getElementById('v-regie').innerText")
    ok('Tropical' not in txt and 'Lieux' not in txt,'Pas de musiques/lieux dans Scènes')
    ok(await pg.locator('#v-regie .tile').count()>0,'Sources de la scène toujours là')
    await pg.click('nav button[data-v=son]');await pg.wait_for_timeout(500)
    s=await pg.evaluate("document.getElementById('v-son').innerText")
    ok('Musiques' not in s and 'Tropical' not in s and 'Micros' in s,'Son : plus de Musiques/Lieux, Micros présent')
    await pg.screenshot(path='t17.png')
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
