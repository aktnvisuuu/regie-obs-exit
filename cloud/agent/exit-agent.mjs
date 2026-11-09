#!/usr/bin/env node
/* =====================================================================
   EXIT Cloud · agent du serveur
   Fait le travail qu'IRLToolkit fait autour d'OBS :
     1. prépare OBS (scènes Ingest / Ingest Low-bitrate / Ingest Offline + source caméra « Ingest Player »)
     2. mesure le flux caméra reçu par MediaMTX (débit, RTT SRT, signal présent ou non)
     3. bascule automatiquement de scène selon le débit (comme le « Auto Scene Switcher »)
     4. diffuse l'état de l'ingest à toutes les télécommandes connectées à OBS, dans le même format
        qu'IRLToolkit (CustomEvent avec ingests[]…) → la Régie EXIT marche telle quelle
   Config : conf/agent.json (voir conf/agent.example.json)
   ===================================================================== */
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const CONF_PATH=process.env.EXIT_AGENT_CONF||path.join(path.dirname(new URL(import.meta.url).pathname),'..','conf','agent.json');
const C=Object.assign({
  obsUrl:'ws://127.0.0.1:4455', obsPassword:'',
  mtxApi:'http://127.0.0.1:9997', ingestPath:'live', ingestName:'Caméra (SRT)',
  playerUrl:'rtsp://127.0.0.1:8554/live',
  lowKbps:1000, offlineKbps:150, rttMaxMs:1500,
  mode:'always',                 // 'streaming' (seulement en live) · 'always' · 'off'
  toLowMs:3000, toOfflineMs:2000, recoverMs:4000,
  broadcastMs:2500,
},JSON.parse(fs.existsSync(CONF_PATH)?fs.readFileSync(CONF_PATH,'utf8'):'{}'));

const SC={ok:'Ingest',low:'Ingest Low-bitrate',off:'Ingest Offline'};
const PLAYER='Ingest Player';
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sha=s=>createHash('sha256').update(s).digest('base64');

/* ---------- connexion OBS (avec reconnexion) ---------- */
let ws=null,ok=false,rid=0;const pend=new Map();
function connect(){
  const me=ws=new WebSocket(C.obsUrl);
  // poignée de main bloquée (OBS en plein démarrage…) : on abandonne et on réessaie
  setTimeout(()=>{if(ws===me&&!ok){try{me.close()}catch(e){}me.onclose=null;setTimeout(connect,1000)}},8000);
  ws.onmessage=ev=>{const m=JSON.parse(ev.data),d=m.d||{};
    if(m.op===0){const id={rpcVersion:1,eventSubscriptions:(1<<2)|(1<<6)};   // Scenes + Outputs
      if(d.authentication)id.authentication=sha(sha(C.obsPassword+d.authentication.salt)+d.authentication.challenge);
      ws.send(JSON.stringify({op:1,d:id}))}
    else if(m.op===2){ok=true;log('OBS connecté');setup().catch(e=>log('setup',e.message))}
    else if(m.op===7){const p=pend.get(d.requestId);if(!p)return;pend.delete(d.requestId);
      d.requestStatus.result?p.res(d.responseData||{}):p.rej(new Error(d.requestStatus.comment||String(d.requestStatus.code)))}
    else if(m.op===5)onEvent(d.eventType,d.eventData||{});
  };
  ws.onclose=()=>{if(ok)log('OBS déconnecté');ok=false;pend.forEach(p=>p.rej(new Error('fermé')));pend.clear();setTimeout(connect,2000)};
  ws.onerror=()=>{};
}
function req(t,data){return new Promise((res,rej)=>{if(!ok)return rej(new Error('OBS non connecté'));const id=String(++rid);
  pend.set(id,{res,rej});ws.send(JSON.stringify({op:6,d:{requestType:t,requestId:id,requestData:data||{}}}));
  setTimeout(()=>{if(pend.delete(id))rej(new Error('délai'))},8000)})}

/* ---------- 1. préparation d'OBS (ne touche à rien s'il existe déjà) ---------- */
async function setup(){
  const scenes=(await req('GetSceneList')).scenes.map(s=>s.sceneName);
  for(const n of [SC.off,SC.low,SC.ok])if(!scenes.includes(n)){await req('CreateScene',{sceneName:n});log('scène créée :',n)}
  const inputs=(await req('GetInputList')).inputs.map(i=>i.inputName);
  if(!inputs.includes(PLAYER)){
    await req('CreateInput',{sceneName:SC.ok,inputName:PLAYER,inputKind:'ffmpeg_source',sceneItemEnabled:true,inputSettings:{
      is_local_file:false,input:C.playerUrl,ffmpeg_options:'rtsp_transport=tcp',reconnect_delay_sec:1,buffering_mb:1,
      restart_on_activate:false,close_when_inactive:false,hw_decode:true,clear_on_media_end:false}});
    log('source caméra créée :',PLAYER);
    // la caméra remplit tout l'écran
    const it=(await req('GetSceneItemList',{sceneName:SC.ok})).sceneItems.find(i=>i.sourceName===PLAYER);
    const v=await req('GetVideoSettings');
    if(it)await req('SetSceneItemTransform',{sceneName:SC.ok,sceneItemId:it.sceneItemId,sceneItemTransform:{boundsType:'OBS_BOUNDS_SCALE_INNER',boundsWidth:v.baseWidth,boundsHeight:v.baseHeight,positionX:0,positionY:0}}).catch(()=>{});
  }
  const low=(await req('GetSceneItemList',{sceneName:SC.low})).sceneItems;
  if(!low.length){
    await req('CreateSceneItem',{sceneName:SC.low,sourceName:SC.ok});
    await req('CreateInput',{sceneName:SC.low,inputName:'Texte connexion faible',inputKind:'text_ft2_source_v2',inputSettings:{text:'Connexion faible…',font:{face:'Sans',size:48}}}).catch(()=>{});
  }
  const off=(await req('GetSceneItemList',{sceneName:SC.off})).sceneItems;
  if(!off.length)await req('CreateInput',{sceneName:SC.off,inputName:'Texte hors ligne',inputKind:'text_ft2_source_v2',inputSettings:{text:'On revient vite',font:{face:'Sans',size:64}}}).catch(()=>{});
  const cur=(await req('GetCurrentProgramScene')).currentProgramSceneName;
  if(!Object.values(SC).includes(cur)&&scenes.length<=1)await req('SetCurrentProgramScene',{sceneName:SC.off});
}

/* ---------- état ---------- */
const st={kbps:0,rtt:null,ready:false,bytes:null,t:0,program:'',streaming:false,want:null,since:0,lastSwitch:0,wasOffline:true};
function onEvent(t,d){
  if(t==='CurrentProgramSceneChanged')st.program=d.sceneName;
  if(t==='StreamStateChanged')st.streaming=d.outputActive;
}

/* ---------- 2. mesure du flux reçu ---------- */
async function measure(){
  try{
    const p=await (await fetch(`${C.mtxApi}/v3/paths/get/${C.ingestPath}`)).json();
    const now=Date.now();
    st.ready=!!p.ready;
    if(st.bytes!=null&&p.bytesReceived>=st.bytes&&now>st.t)st.kbps=Math.round((p.bytesReceived-st.bytes)*8/(now-st.t));   // octets/ms → kbit/s
    else if(!p.ready)st.kbps=0;
    st.bytes=p.bytesReceived;st.t=now;
    st.rtt=null;
    if(p.ready&&p.source&&p.source.type==='srtConn'){
      try{const c=await (await fetch(`${C.mtxApi}/v3/srtconns/get/${p.source.id}`)).json();st.rtt=c.msRTT??null}catch(e){}
    }
  }catch(e){st.ready=false;st.kbps=0}
}

/* ---------- 3. bascule automatique ---------- */
function target(){
  if(!st.ready||st.kbps<C.offlineKbps)return 'off';
  if(st.kbps<C.lowKbps||(st.rtt!=null&&st.rtt>C.rttMaxMs))return 'low';
  return 'ok';
}
async function autoswitch(){
  if(!ok||C.mode==='off')return;
  if(C.mode==='streaming'&&!st.streaming)return;
  const keys=Object.keys(SC),cur=keys.find(k=>SC[k]===st.program);
  if(!cur)return;                                 // scène perso choisie à la main → on ne touche à rien
  const t=target(),now=Date.now();
  if(t!==st.want){st.want=t;st.since=now}
  if(t===cur)return;
  const wait=t==='off'?C.toOfflineMs:t==='low'?C.toLowMs:C.recoverMs;
  if(now-st.since<wait||now-st.lastSwitch<1500)return;
  try{
    if(cur==='off'&&t!=='off')await req('TriggerMediaInputAction',{inputName:PLAYER,mediaAction:'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART'}).catch(()=>{});
    await req('SetCurrentProgramScene',{sceneName:SC[t]});st.lastSwitch=now;
    log(`bascule ${SC[cur]} → ${SC[t]} (${st.kbps} kb/s${st.rtt!=null?', RTT '+Math.round(st.rtt)+' ms':''})`);
  }catch(e){log('bascule',e.message)}
}

/* ---------- 4. diffusion de l'état (format IRLToolkit) ---------- */
async function broadcast(){
  if(!ok)return;
  const ing={id:C.ingestPath,name:C.ingestName,router_bitrate:st.kbps,router_rtt:st.rtt??0,media_state:st.ready?'OBS_MEDIA_STATE_PLAYING':'OBS_MEDIA_STATE_NONE'};
  await req('BroadcastCustomEvent',{eventData:{source:'exit-agent',ingests:[ing],main_ingest_id:C.ingestPath,
    low_bitrate_trigger:C.lowKbps,offline_bitrate_trigger:C.offlineKbps,auto_scene_switch_mode:C.mode,
    output_status:{stream_status:st.streaming}}}).catch(()=>{});
}

/* ---------- boucle ---------- */
connect();
(async()=>{
  let lastB=0;
  for(;;){
    await measure();
    if(ok){
      try{st.program=(await req('GetCurrentProgramScene')).currentProgramSceneName;st.streaming=(await req('GetStreamStatus')).outputActive}catch(e){}
      await autoswitch();
      if(Date.now()-lastB>=C.broadcastMs){lastB=Date.now();await broadcast()}
    }
    await sleep(500);
  }
})();
process.on('SIGTERM',()=>process.exit(0));
