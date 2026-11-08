import asyncio
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
SW="""([dx])=>{const el=document.querySelector('#v-regie .big')||document.getElementById('main');const r=el.getBoundingClientRect();const x=200,y=r.top+10;
 const T=(xx)=>new Touch({identifier:1,target:el,clientX:xx,clientY:y});
 el.dispatchEvent(new TouchEvent('touchstart',{touches:[T(x)],changedTouches:[T(x)],bubbles:true}));
 el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[T(x+dx)],bubbles:true}))}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 15 Pro'])
    await c.add_init_script(path='fake2.js');await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama'}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('file://'+__import__('os').path.abspath('index.html')+'');await pg.wait_for_timeout(2500)
    x0=await pg.evaluate("document.querySelector('nav .ind').getBoundingClientRect().x")
    bx=await pg.evaluate("document.querySelector('nav button[data-v=regie]').getBoundingClientRect().x")
    ok(abs(x0-bx)<2,'Pastille sous « Scènes » au départ')
    await pg.click('nav button[data-v=son]');await pg.wait_for_timeout(220)
    mid=await pg.evaluate("getComputedStyle(document.querySelector('nav .ind')).transform")
    await pg.screenshot(path='t19a.png',clip={'x':0,'y':570,'width':393,'height':90})
    await pg.wait_for_timeout(700)
    x1=await pg.evaluate("document.querySelector('nav .ind').getBoundingClientRect().x")
    sx=await pg.evaluate("document.querySelector('nav button[data-v=son]').getBoundingClientRect().x")
    ok(abs(x1-sx)<2,'La pastille a glissé jusqu’à « Son »')
    ok('matrix' in mid,'Effet d’étirement pendant le glissé ('+mid[:40]+')')
    ok(await pg.evaluate("document.getElementById('v-son').classList.contains('fromR')"),'Son arrive par la droite')
    await pg.screenshot(path='t19b.png',clip={'x':0,'y':570,'width':393,'height':90})
    await pg.evaluate(SW.replace("#v-regie .big","#v-son .big"),[160]);await pg.wait_for_timeout(600)
    ok(await pg.evaluate("S.view")=='regie','Glisser vers la droite → retour à Scènes')
    ok(await pg.evaluate("document.getElementById('v-regie').classList.contains('fromL')"),'Scènes arrive par la gauche')
    await pg.evaluate(SW,[-160]);await pg.wait_for_timeout(600)
    ok(await pg.evaluate("S.view")=='son','Glisser vers la gauche → Son')
    ok(await pg.evaluate("document.documentElement.scrollWidth<=innerWidth"),'Pas de débordement horizontal')
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
