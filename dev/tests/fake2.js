(()=>{const EXPECTED='HR1zaQLTUxIImsUMUG0oKi1ofJwuRHC3C8MIfGjIsNc=';window.__log=[];window.__freeze=false;
let program='Caméra LiveU';const scenes=['Caméra LiveU','Caméra + bandeau','Secours – on revient','Fin du live','Ingest Low-bitrate'];
const cam=[{sceneItemId:1,sourceName:'SRT LiveU',sceneItemEnabled:true,inputKind:'ffmpeg_source',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:0},
 {sceneItemId:3,sourceName:'Overlays',sceneItemEnabled:true,inputKind:null,sourceType:'OBS_SOURCE_TYPE_SCENE',sceneItemIndex:2}];
const items={'Caméra LiveU':cam,'Caméra + bandeau':cam,'Ingest Low-bitrate':[{sceneItemId:1,sourceName:'SRT LiveU',sceneItemEnabled:true,inputKind:'ffmpeg_source',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:0},{sceneItemId:2,sourceName:'Low bitrate text',sceneItemEnabled:true,inputKind:'text_ft2_source_v2',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:1}],
 'Overlays':[{sceneItemId:1,sourceName:'[Sponsor] Red Bull',sceneItemEnabled:false,inputKind:'ffmpeg_source',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:0},
 {sceneItemId:2,sourceName:'[Insert] Zoom glitch',sceneItemEnabled:false,inputKind:'image_source',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:1},
 {sceneItemId:3,sourceName:'[Habillage] Logo Grunt',sceneItemEnabled:true,inputKind:'image_source',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:2},
 {sceneItemId:4,sourceName:'[Habillage] Nom artiste',sceneItemEnabled:false,inputKind:'text_gdiplus_v3',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:3}],
 'Secours – on revient':[{sceneItemId:9,sourceName:'Visuel on revient',sceneItemEnabled:true,inputKind:'image_source',sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:0}]};
const inputs=[['SRT LiveU','ffmpeg_source'],['Micro ambiance','wasapi_input_capture'],['Audio du bureau','wasapi_output_capture'],['[Sponsor] Red Bull','ffmpeg_source'],['[Habillage] Logo Grunt','image_source'],['[Habillage] Nom artiste','text_gdiplus_v3'],['Visuel on revient','image_source'],['[Insert] Zoom glitch','image_source']];
const audio={'SRT LiveU':{m:false,v:0},'Micro ambiance':{m:true,v:-6},'Audio du bureau':{m:false,v:-12.5},'[Sponsor] Red Bull':{m:false,v:-3}};
const filters={'Caméra LiveU':[{filterName:'N&B',filterEnabled:false},{filterName:'Zoom 1.3x',filterEnabled:true}],'SRT LiveU':[{filterName:'LUT festival',filterEnabled:true},{filterName:'Flou',filterEnabled:false}]};
let text='DJ Exemple';let trCur='Fondu',trDur=300;window.__lat=40;
function shot(name,w){const c=document.createElement('canvas');c.width=w;c.height=Math.round(w*9/16);const g=c.getContext('2d');
 const t=Date.now()/1000;g.fillStyle=(window.__freeze&&name==='SRT LiveU')?'#333':'hsl('+((t*40)%360)+',60%,25%)';g.fillRect(0,0,c.width,c.height);
 g.fillStyle='#fff';g.font='bold '+(w/14)+'px sans-serif';g.fillText(name,w*.05,w*.15);
 if(!(window.__freeze&&name==='SRT LiveU'))g.fillText(new Date().toLocaleTimeString()+'.'+Date.now()%1000,w*.05,w*.3);
 if(name===program){const ov=items['Overlays'];if(ov[2].sceneItemEnabled){g.fillStyle='#ff0';g.fillText('GRUNT',w*.72,w*.15)}if(ov[3].sceneItemEnabled){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(w*.05,w*.42,w*.6,w*.1);g.fillStyle='#fff';g.fillText(text,w*.08,w*.49)}}
 return c.toDataURL('image/jpeg',.6).replace('image/jpeg','image/jpg')}
let bytes=0;const t0=Date.now();
class F{constructor(){window.__ws=this;window.__br=window.__br??5200;window.__mode=window.__mode||'direct';setTimeout(()=>this.emit({op:0,d:{rpcVersion:1,authentication:{challenge:'ch4l',salt:'s4lt'}}}),50)}
 emit(o){if(window.__zombie)return;this.onmessage&&this.onmessage({data:JSON.stringify(o)})}
 close(c){clearInterval(this.mt);this.onclose&&this.onclose({code:c||1000})}
 ev(t,d){setTimeout(()=>this.emit({op:5,d:{eventType:t,eventData:d}}),30)}
 send(m){const msg=JSON.parse(m);(window.__sent=window.__sent||[]).push([Date.now(),msg.d&&msg.d.requestType,msg.d&&msg.d.requestData&&msg.d.requestData.imageWidth]);if(window.__zombie)return;
  if(msg.op===1){if(msg.d.authentication!==EXPECTED){__log.push('AUTH FAIL');this.close(4009);return}__log.push('AUTH OK subs='+msg.d.eventSubscriptions);this.emit({op:2,d:{}});
    this.it=setInterval(()=>{const st={ingests:[{id:'xyz001',media_state:window.__br>150?'OBS_MEDIA_STATE_PLAYING':'OBS_MEDIA_STATE_OPENING',muted:false,name:'First Ingest',router_bitrate:Math.max(0,window.__br+Math.round((Math.random()-.5)*600)),router_rtt:48,type:'srt',volume:1}],auto_scene_switch_mode:'enabled_output_active',low_bitrate_trigger:1000,main_ingest_id:'xyz001',offline_bitrate_trigger:150,offline_exit_delay_seconds:1.5,output_status:{stream_status:true,stream_timecode:'01:02:03'}};
      if(window.__mode==='direct')this.emit({op:5,d:{eventType:'IRLTKStatusUpdate',eventIntent:1,eventData:st}});
      else if(window.__mode==='vendor')this.emit({op:5,d:{eventType:'VendorEvent',eventData:{vendorName:'irltoolkit',eventType:'IRLTKStatusUpdate',eventData:st}}});
      else if(window.__mode==='custom')this.emit({op:5,d:{eventType:'CustomEvent',eventData:{eventData:st}}});
    },window.__irlEvery||400);
    this.mt=setInterval(()=>{const tt=Date.now()/300;this.emit({op:5,d:{eventType:'InputVolumeMeters',eventData:{inputs:[
      {inputName:'SRT LiveU',inputLevelsMul:[[.3,.35+.3*Math.abs(Math.sin(tt)),.5],[.3,.3+.3*Math.abs(Math.cos(tt)),.5]]},
      {inputName:'Audio du bureau',inputLevelsMul:[[0,0,0],[0,0,0]]},
      {inputName:'Micro ambiance',inputLevelsMul:[[.05,.08,.1]]}]}}})},50);return}
  const{requestType:t,requestId:id,requestData:d}=msg.d;__log.push(t+' '+JSON.stringify(d));let r={},fail=0;
  if(t==='GetSceneList')r={currentProgramSceneName:program,scenes:scenes.map((s,i)=>({sceneName:s,sceneIndex:scenes.length-1-i}))};
  else if(t==='CreateScene'){if(scenes.includes(d.sceneName))fail=601;else{scenes.push(d.sceneName);items[d.sceneName]=[];this.ev('SceneCreated',{sceneName:d.sceneName})}}
  else if(t==='CreateInput'){const l=items[d.sceneName];if(!l)fail=600;else if(inputs.some(i=>i[0]===d.inputName))fail=601;else{inputs.push([d.inputName,d.inputKind]);window.__settings[d.inputName]=d.inputSettings;const id=(l.reduce((m,i)=>Math.max(m,i.sceneItemId),0)||0)+1;l.push({sceneItemId:id,sourceName:d.inputName,sceneItemEnabled:d.sceneItemEnabled!==false,inputKind:d.inputKind,sourceType:'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:l.length});r={sceneItemId:id,inputUuid:'u'+id}}}
  else if(t==='CreateSceneItem'){const l=items[d.sceneName];if(!l)fail=600;else{const id=(l.reduce((m,i)=>Math.max(m,i.sceneItemId),0)||0)+1;l.push({sceneItemId:id,sourceName:d.sourceName,sceneItemEnabled:true,inputKind:null,sourceType:scenes.includes(d.sourceName)?'OBS_SOURCE_TYPE_SCENE':'OBS_SOURCE_TYPE_INPUT',sceneItemIndex:l.length});r={sceneItemId:id}}}
  else if(t==='SetSceneItemIndex'){const l=items[d.sceneName];const it=l.find(i=>i.sceneItemId===d.sceneItemId);l.splice(l.indexOf(it),1);l.splice(d.sceneItemIndex,0,it);l.forEach((x,k)=>x.sceneItemIndex=k)}
  else if(t==='SetSceneItemTransform'||t==='BroadcastCustomEvent'){if(t==='BroadcastCustomEvent'){window.__bcast.push(d.eventData);this.ev('CustomEvent',{eventData:d.eventData})}}
  else if(t==='GetVideoSettings')r={baseWidth:1920,baseHeight:1080};
  else if(t==='SetMediaInputCursor'){const m=window.__media[d.inputName]||(window.__media[d.inputName]={});m.cursor=d.mediaCursor;m.since=Date.now();m.seeks=(m.seeks||0)+1}
  else if(t==='GetMediaInputStatus'){const m=window.__media[d.inputName]||{};if(m.state==='OBS_MEDIA_STATE_PLAYING'&&m.since){m.cursor=(m.cursor||0)+(Date.now()-m.since);m.since=Date.now()}r={mediaState:m.state||'OBS_MEDIA_STATE_STOPPED',mediaCursor:m.cursor||0,mediaDuration:300000}}
  else if(t==='CreateSourceFilter'){window.__flt=window.__flt||{};const L=filters[d.sourceName]||(filters[d.sourceName]=[]);if(L.some(f=>f.filterName===d.filterName))fail=601;else{window.__flt[d.sourceName+'|'+d.filterName]=Object.assign({},d.filterSettings);L.push({filterName:d.filterName,filterKind:d.filterKind,filterEnabled:true,filterSettings:window.__flt[d.sourceName+'|'+d.filterName]});this.ev('SourceFilterCreated',{sourceName:d.sourceName,filterName:d.filterName})}}
  else if(t==='RemoveSourceFilter'){filters[d.sourceName]=(filters[d.sourceName]||[]).filter(f=>f.filterName!==d.filterName);this.ev('SourceFilterRemoved',{sourceName:d.sourceName,filterName:d.filterName})}
  else if(t==='GetSourceFilter'){window.__flt=window.__flt||{};const f=window.__flt[d.sourceName+'|'+d.filterName];if(!f)fail=600;else r={filterEnabled:true,filterSettings:f}}
  else if(t==='SetSourceFilterSettings'){window.__flt=window.__flt||{};const k=d.sourceName+'|'+d.filterName;if(!window.__flt[k])fail=600;else{Object.assign(window.__flt[k],d.filterSettings);(window.__fltLog=window.__fltLog||[]).push(d.filterSettings.opacity)}}
  else if(t==='SetPersistentData'){window.__pd=window.__pd||{};window.__pd[d.slotName]=d.slotValue}
  else if(t==='GetPersistentData'){window.__pd=window.__pd||{};r={slotValue:window.__pd[d.slotName]??null}}
  else if(t==='RemoveInput'){window.__removed=(window.__removed||[]).concat(d.inputName);for(const k in items){items[k]=items[k].filter(i=>i.sourceName!==d.inputName)}}
  else if(t==='GetSceneItemId'){const it=(items[d.sceneName]||[]).find(i=>i.sourceName===d.sourceName);if(!it)fail=600;else r={sceneItemId:it.sceneItemId}}
  else if(t==='GetSceneItemList')r={sceneItems:items[d.sceneName]||[]};
  else if(t==='GetInputList'){for(const e of (window.__extraInputs||[]))if(!inputs.some(i=>i[0]===e[0]))inputs.push(e);r={inputs:inputs.map(([n,k])=>({inputName:n,inputKind:k}))}}
  else if(t==='GetInputMute'){window.__mute=window.__mute||{};if(audio[d.inputName])r={inputMuted:audio[d.inputName].m};else if(/^\[(Musiques|Lieux)\]|Ingest Player/.test(d.inputName))r={inputMuted:!!window.__mute[d.inputName]};else fail=604}
  else if(t==='SetInputMute'){window.__mute=window.__mute||{};window.__mute[d.inputName]=d.inputMuted;this.ev('InputMuteStateChanged',{inputName:d.inputName,inputMuted:d.inputMuted})}
  else if(t==='GetInputVolume'){window.__vol=window.__vol||{};if(audio[d.inputName])r={inputVolumeDb:audio[d.inputName].v,inputVolumeMul:Math.pow(10,audio[d.inputName].v/20)};else{const m=window.__vol[d.inputName]??1;r={inputVolumeMul:m,inputVolumeDb:m>0?20*Math.log10(m):-100}}}
  else if(t==='SetInputVolume'&&!audio[d.inputName]){window.__vol=window.__vol||{};window.__vol[d.inputName]=d.inputVolumeMul!==undefined?d.inputVolumeMul:(d.inputVolumeDb<=-100?0:Math.pow(10,d.inputVolumeDb/20));(window.__volLog=window.__volLog||[]).push(d.inputVolumeMul)}
  else if(t==='SetInputVolume'){audio[d.inputName].v=d.inputVolumeDb;this.ev('InputVolumeChanged',{inputName:d.inputName,inputVolumeDb:d.inputVolumeDb})}
  else if(t==='ToggleInputMute'){audio[d.inputName].m=!audio[d.inputName].m;this.ev('InputMuteStateChanged',{inputName:d.inputName,inputMuted:audio[d.inputName].m})}
  else if(t==='GetSourceFilterList')r={filters:filters[d.sourceName]||[]};
  else if(t==='SetSourceFilterEnabled'){(filters[d.sourceName]||[]).forEach(f=>{if(f.filterName===d.filterName)f.filterEnabled=d.filterEnabled});this.ev('SourceFilterEnableStateChanged',d)}
  else if(t==='GetInputSettings'){if(window.__settings[d.inputName])r={inputSettings:window.__settings[d.inputName]};else if(d.inputName==='[Habillage] Logo Grunt')r={inputSettings:{file:'/home/irl/obs/dependencies/logo.png'}};else if(!inputs.some(i=>i[0]===d.inputName))fail=600;else r={inputSettings:{text}}}
  else if(t==='SetInputSettings'){if(d.inputSettings.text!==undefined)text=d.inputSettings.text;window.__settings[d.inputName]=Object.assign({},window.__settings[d.inputName]||{},d.inputSettings)}
  else if(t==='GetSourceScreenshot'){if(!scenes.includes(d.sourceName)&&!inputs.some(i=>i[0]===d.sourceName)&&d.sourceName!=='Overlays')fail=600;else r={imageData:shot(d.sourceName,d.imageWidth)}}
  else if(t==='GetSceneTransitionList')r={currentSceneTransitionName:trCur,transitions:[{transitionName:'Coupure',transitionFixed:true},{transitionName:'Fondu',transitionFixed:false},{transitionName:'Glissement',transitionFixed:false}]};
  else if(t==='GetCurrentSceneTransition')r={transitionName:trCur,transitionDuration:trCur==='Coupure'?null:trDur,transitionFixed:trCur==='Coupure'};
  else if(t==='SetCurrentSceneTransition'){trCur=d.transitionName;this.ev('CurrentSceneTransitionChanged',{transitionName:trCur})}
  else if(t==='SetCurrentSceneTransitionDuration'){trDur=d.transitionDuration;this.ev('CurrentSceneTransitionDurationChanged',{transitionDuration:trDur})}
  else if(t==='GetStreamStatus'){bytes+=1500000;window.__tot=(window.__tot||98000)+100;window.__sk=(window.__sk||12)+(window.__skipRate||0);r={outputActive:true,outputReconnecting:false,outputDuration:Date.now()-t0+3723000,outputBytes:bytes,outputSkippedFrames:window.__sk,outputTotalFrames:window.__tot}}
  else if(t==='GetStats')r={cpuUsage:34.2,activeFps:50,renderSkippedFrames:0};
  else if(t==='SetCurrentProgramScene'){program=d.sceneName;this.ev('CurrentProgramSceneChanged',{sceneName:program})}
  else if(t==='SetSceneItemEnabled'){(items[d.sceneName]||[]).forEach(i=>{if(i.sceneItemId===d.sceneItemId)i.sceneItemEnabled=d.sceneItemEnabled});this.ev('SceneItemEnableStateChanged',d)}
  else if(t==='TriggerMediaInputAction'){const m=window.__media[d.inputName]||(window.__media[d.inputName]={});const a=d.mediaAction.split('_').pop();if(m.state==='OBS_MEDIA_STATE_PLAYING'&&m.since)m.cursor=(m.cursor||0)+(Date.now()-m.since);m.state={RESTART:'OBS_MEDIA_STATE_PLAYING',PLAY:'OBS_MEDIA_STATE_PLAYING',PAUSE:'OBS_MEDIA_STATE_PAUSED',STOP:'OBS_MEDIA_STATE_STOPPED'}[a];if(a==='RESTART')m.cursor=0;m.since=Date.now();m.log=(m.log||[]).concat(a);if(d.mediaAction.endsWith('RESTART'))this.ev('MediaInputPlaybackStarted',{inputName:d.inputName})}
  setTimeout(()=>this.emit({op:7,d:{requestType:t,requestId:id,requestStatus:fail?{result:false,code:fail}:{result:true,code:100},responseData:r}}),t==='GetSourceScreenshot'?window.__lat:15);
 }}
window.WebSocket=F;window.__media={};window.__settings={};window.__bcast=[];window.__scenes=scenes;window.__items=items;window.__text=()=>text;})();
