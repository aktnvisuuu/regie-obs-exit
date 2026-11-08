import asyncio
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
SW="""(async([sel,d,ms])=>{const el=document.querySelector(sel);const r=el.getBoundingClientRect();const x=r.left+r.width/2;let y=r.top+40;
 const T=(yy)=>new Touch({identifier:1,target:el,clientX:x,clientY:yy});
 el.dispatchEvent(new TouchEvent('touchstart',{touches:[T(y)],bubbles:true,cancelable:true}));
 const steps=8;for(let i=1;i<=steps;i++){await new Promise(r=>setTimeout(r,ms/steps));el.dispatchEvent(new TouchEvent('touchmove',{touches:[T(y+d*i/steps)],bubbles:true,cancelable:true}))}
 el.dispatchEvent(new TouchEvent('touchend',{touches:[],bubbles:true,cancelable:true}))})"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    c=await b.new_context(**p.devices['iPhone 15 Pro']);await c.add_init_script(path='fake2.js');await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama'}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('file://'+__import__('os').path.abspath('index.html')+'');await pg.wait_for_timeout(3000)
    pv=await pg.evaluate("document.getElementById('pv').innerText.trim()")
    ok('PROGRAMME' not in pv and 'img/s' not in pv and 'Programme' not in pv,'Plus rien par-dessus l’image ('+repr(pv[:40])+')')
    ok(await pg.is_visible('.stats .pvInfo'),'images/s sous l’image')
    await pg.select_option('#pvFpsSel','10');await pg.wait_for_timeout(200)
    ok(await pg.evaluate("cfg.pvFps")==10,'Choix des images/s toujours fonctionnel')
    # menu ⚙︎ : apparition en glissé, fermeture en glissant
    await pg.click('#gear');await pg.wait_for_timeout(80)
    t1=await pg.evaluate("getComputedStyle(document.querySelector('#sheet .panel')).transform")
    await pg.wait_for_timeout(450)
    t2=await pg.evaluate("getComputedStyle(document.querySelector('#sheet .panel')).transform")
    ok(t1!=t2 and t2 in ('none','matrix(1, 0, 0, 1, 0, 0)'),'Le menu ⚙︎ monte en douceur depuis le bas')
    await pg.screenshot(path='t16a.png')
    await pg.evaluate(SW,['#sheet .panel',40,500]);await pg.wait_for_timeout(500)
    ok(await pg.evaluate("document.getElementById('sheet').classList.contains('on')"),'Petit glissé lent → le menu revient en place')
    await pg.evaluate(SW,['#sheet .panel',260,250]);await pg.wait_for_timeout(600)
    ok(not await pg.evaluate("document.getElementById('sheet').classList.contains('on')") and not await pg.is_visible('#sheet .panel'),'Glisser vers le bas → menu ⚙︎ fermé')
    # menu options d'une source
    await pg.click('#v-regie .tile .more');await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(500)
    ok(await pg.is_visible('#dPanel'),'Menu ••• d’une source ouvert')
    await pg.evaluate(SW,['#dPanel',260,250]);await pg.wait_for_timeout(600)
    ok(not await pg.is_visible('#dPanel'),'Glisser vers le bas → menu ••• fermé')
    await pg.click('nav button[data-v=regie]');await pg.wait_for_timeout(500)
    await pg.evaluate("window.scrollTo(0,0)");await pg.wait_for_timeout(200);await pg.screenshot(path='t16b.png',clip={'x':0,'y':0,'width':393,'height':420})
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
