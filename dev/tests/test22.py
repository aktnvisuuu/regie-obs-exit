# Onglet LUT : uniquement sur la caméra LiveU
import asyncio,os
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 15 Pro'])
    await c.add_init_script(path='fake2.js');await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama'}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('file://'+os.path.abspath('index.html'));await pg.wait_for_timeout(3000)
    src=await pg.evaluate("LUT.src");ok(src=='Ingest Player','Caméra visée : '+src)
    ok([x for x in await pg.evaluate("[...document.querySelectorAll('nav button')].map(b=>b.textContent)")]==['Scènes','Son','LUT'],'3 onglets : Scènes · Son · LUT')
    await pg.click('nav button[data-v=lut]');await pg.wait_for_timeout(700)
    ok('Ingest Player' in await pg.inner_text('#v-lut'),'Écrit « Appliqué uniquement sur Ingest Player »')
    await pg.click('#lutAdd');await pg.wait_for_timeout(600)
    await pg.click('[data-pack="0"]');await pg.wait_for_timeout(2500)
    fl=await pg.evaluate("(window.__flt&&Object.keys(window.__flt))||[]")
    luts=[k for k in fl if '|LUT · ' in k]
    ok(len(luts)==11 and all(k.startswith('Ingest Player|') for k in luts),f'Tous les LUT : 11 créés, tous sur Ingest Player ({len(luts)})')
    st=await pg.evaluate("window.__flt['Ingest Player|LUT · Neutral']")
    ok(st['image_path'].endswith('/dependencies/Neutral.cube'),'Chemin du fichier : '+st['image_path'])
    ok(await pg.evaluate("LUT.list.every(l=>!l.on)"),'Ajoutés éteints (rien ne change à l’antenne)')
    ok(await pg.locator('#v-lut .lut').count()==12,'12 tuiles (Aucun + tes 11 LUT)')
    labs=await pg.evaluate('LUT.list.map(l=>l.label)')
    ok(len(labs)==11 and 'Conversion 709' in labs and 'Ice Blue' in labs and 'Exterieur 01' in labs and 'Filmkid16' in labs,'Noms propres : '+', '.join(labs))
    ok(await pg.evaluate("window.__flt['Ingest Player|LUT · Ice Blue'].image_path.endsWith('/Ice-Blue.cube')"),'Fichier Ice-Blue.cube visé')
    await pg.click('#lutAdd');await pg.wait_for_timeout(400)
    ok(await pg.locator('[data-pack]').count()==0 and 'Arthur' not in await pg.inner_text('#dPanel'),'Plus de bouton pack une fois tout ajouté, aucun « Pack Arthur »')
    await pg.click('#dClose');await pg.wait_for_timeout(400)
    await pg.click('#v-lut .lut:has-text("Utopia")');await pg.wait_for_timeout(600)
    ok(await pg.evaluate("LUT.list.filter(l=>l.on).map(l=>l.label).join()")=='Utopia','Toucher Utopia → seul LUT actif')
    await pg.click('#v-lut .lut:has-text("Green Eyes")');await pg.wait_for_timeout(600)
    ok(await pg.evaluate("LUT.list.filter(l=>l.on).map(l=>l.label).join()")=='Green Eyes','Toucher Green Eyes → remplace Utopia')
    await pg.evaluate("const s=document.getElementById('lutAmt');s.value=40;s.dispatchEvent(new Event('input',{bubbles:true}))");await pg.wait_for_timeout(400)
    ok(abs(await pg.evaluate("window.__flt['Ingest Player|LUT · Green Eyes'].clut_amount")-0.4)<1e-6,'Intensité 40 % envoyée à OBS')
    await pg.screenshot(path='t22b.png')
    # quelqu'un allume un 2e LUT directement dans OBS → la Régie coupe l'autre toute seule
    await pg.evaluate("window.__ws.send(JSON.stringify({op:6,d:{requestType:'SetSourceFilterEnabled',requestId:'zz',requestData:{sourceName:'Ingest Player',filterName:'LUT · Neutral',filterEnabled:true}}}))");await pg.wait_for_timeout(1500)
    on=[f['filterName'] for f in await pg.evaluate("(async()=>(await req('GetSourceFilterList',{sourceName:'Ingest Player'})).filters.filter(f=>f.filterEnabled))()")]
    ok(on==['LUT · Neutral'],'Un 2e LUT allumé ailleurs → l’ancien est coupé, jamais deux à la fois ('+', '.join(on)+')')
    for k in range(5):
      await pg.click('#v-lut .lut:has-text("Tungsten")' if k%2 else '#v-lut .lut:has-text("Utopia")')
    await pg.wait_for_timeout(1500)
    on=[f['filterName'] for f in await pg.evaluate("(async()=>(await req('GetSourceFilterList',{sourceName:'Ingest Player'})).filters.filter(f=>f.filterEnabled))()")]
    ok(len(on)==1,'Taps rapides en rafale → toujours un seul LUT ('+', '.join(on)+')')
    await pg.click('#v-lut .lut.none');await pg.wait_for_timeout(600)
    ok(await pg.evaluate("LUT.list.every(l=>!l.on)"),'« Aucun » → tous coupés')
    # pas de LUT dans les effets des autres menus
    await pg.click('nav button[data-v=regie]');await pg.wait_for_timeout(500)
    ok('LUT · ' not in await pg.inner_text('#v-regie'),'Les LUT n’encombrent pas l’onglet Scènes')
    # ajout manuel + suppression
    await pg.click('nav button[data-v=lut]');await pg.wait_for_timeout(500)
    await pg.click('#lutAdd');await pg.wait_for_timeout(400);await pg.fill('#lutFiles','MonLook.cube');await pg.click('#lutGo');await pg.wait_for_timeout(1200)
    ok(await pg.evaluate("LUT.list.some(l=>l.label==='MonLook')"),'Ajout manuel « MonLook.cube »')
    await pg.click('#v-lut .lut:has-text("MonLook") .more');await pg.wait_for_timeout(400);await pg.click('#lutDel');await pg.wait_for_timeout(1000)
    ok(not await pg.evaluate("LUT.list.some(l=>l.label==='MonLook')"),'Suppression d’un LUT')
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
