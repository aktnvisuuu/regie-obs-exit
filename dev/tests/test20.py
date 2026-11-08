# Fiabilité : commandes prioritaires, aperçu adaptatif, connexion fantôme, alertes vibrantes
import asyncio,os
from playwright.async_api import async_playwright
ok=lambda c,m:print(('✅ ' if c else '❌ ')+m)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();c=await b.new_context(**p.devices['iPhone 15 Pro'])
    await c.add_init_script(path='fake2.js');await c.add_init_script(path='ingestinit.js')
    await c.add_init_script("window.__vib=0;navigator.vibrate=()=>{window.__vib++;return true};localStorage.setItem('regie-obs-v2',JSON.stringify({host:'wss://x',pass:'grunt2026',code:'drama',pvFps:10}))")
    pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto('file://'+os.path.abspath('index.html'));await pg.wait_for_timeout(3000)
    # 1. commande prioritaire
    t=await pg.evaluate("Date.now()");await pg.click('#v-regie .scene:not(.prog)');await pg.wait_for_timeout(1200)
    sent=await pg.evaluate(f"window.__sent.filter(x=>x[0]>={t})")
    tc=[x[0] for x in sent if x[1]=='SetCurrentProgramScene'][0]
    shots=[x[0]-tc for x in sent if x[1]=='GetSourceScreenshot' and 0<x[0]-tc<650]
    ok(not shots,'Changement de scène : aucune capture d’aperçu envoyée pendant 0,65 s ('+str(shots[:3])+')')
    # 2. aperçu adaptatif
    await pg.evaluate("window.__lat=1600");await pg.wait_for_timeout(7000)
    lv=await pg.evaluate("PV.lvl");w=await pg.evaluate("window.__sent.filter(x=>x[1]==='GetSourceScreenshot').slice(-1)[0][2]")
    ok(lv>=1 and w<=480,f'Réseau lent → aperçu allégé tout seul (niveau {lv}, {w} px)')
    ok('allégé' in (await pg.text_content('#pvInfoL')),'Affiché « Img/s · allégé »')
    await pg.evaluate("window.__lat=40");await pg.wait_for_timeout(9000)
    ok(await pg.evaluate("PV.lvl")==0,'Réseau revenu → aperçu normal')
    # 3. connexion fantôme
    w0=await pg.evaluate("window.__ws");await pg.evaluate("window.__oldws=window.__ws;window.__zombie=true")
    await pg.wait_for_timeout(2500);await pg.evaluate("window.__zombie=false")
    ok(await pg.evaluate("window.__ws===window.__oldws"),'Coupure courte (2,5 s) : pas de reconnexion inutile')
    await pg.evaluate("window.__zombie=true");await pg.wait_for_timeout(7500)
    ok(await pg.evaluate("window.__ws!==window.__oldws"),'Connexion fantôme (OBS muet > 6 s) → nouvelle connexion lancée')
    await pg.evaluate("window.__zombie=false");await pg.wait_for_timeout(14000)
    ok(await pg.evaluate("S.ok"),'Reconnecté tout seul')
    # 4. alertes qui vibrent
    v0=await pg.evaluate("window.__vib");await pg.evaluate("window.__br=600");await pg.wait_for_timeout(6500)
    a=await pg.inner_text('#alert');v1=await pg.evaluate("window.__vib")
    ok('Débit LiveU faible' in a,'Débit LiveU qui chute → alerte « '+a[:60]+' »')
    ok(v1-v0>=3,f'… et le téléphone vibre ({v1-v0} coups)')
    await pg.evaluate("window.__br=5200");await pg.wait_for_timeout(2000)
    ok('Débit' not in await pg.inner_text('#alert'),'Débit revenu → alerte disparue')
    await pg.evaluate("window.__skipRate=10");await pg.wait_for_timeout(5000)
    ok('Images perdues' in await pg.inner_text('#alert'),'Images perdues → alerte')
    await pg.evaluate("window.__skipRate=0");await pg.wait_for_timeout(11000)
    ok('Images perdues' not in await pg.inner_text('#alert'),'Plus de pertes depuis 10 s → alerte disparue')
    await pg.evaluate("req('SetInputMute',{inputName:entrySource(),inputMuted:true})");await pg.wait_for_timeout(1500)
    ok('Micros coupés' in await pg.inner_text('#alert'),'Micros en MUTE → alerte')
    await pg.evaluate("req('SetInputMute',{inputName:entrySource(),inputMuted:false})");await pg.wait_for_timeout(1200)
    await pg.evaluate("cfg.buzz=false");v2=await pg.evaluate("window.__vib");await pg.evaluate("window.__br=600");await pg.wait_for_timeout(6000)
    ok(await pg.evaluate("window.__vib")==v2,'Option « Alertes qui vibrent » coupée → pas de vibration')
    ok(not e,'Aucune erreur '+str(e[:1]))
    await b.close()
asyncio.run(main())
