// petit outil : node tools/obsreq.mjs '[["GetVersion",{}]]'  → exécute des requêtes OBS et affiche les réponses
import {createHash} from 'node:crypto';
const sha=s=>createHash('sha256').update(s).digest('base64');
const url=process.env.OBS_URL||'ws://127.0.0.1:4455',pw=process.env.OBS_PASS||'testexit';
const reqs=JSON.parse(process.argv[2]||'[["GetVersion",{}]]');
const ws=new WebSocket(url);
ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.op===0){const d={rpcVersion:1,eventSubscriptions:0};if(m.d.authentication)d.authentication=sha(sha(pw+m.d.authentication.salt)+m.d.authentication.challenge);ws.send(JSON.stringify({op:1,d}))}
  else if(m.op===2)ws.send(JSON.stringify({op:8,d:{requestId:'b',haltOnFailure:false,requests:reqs.map(([t,d])=>({requestType:t,requestData:d}))}}));
  else if(m.op===9){for(const r of m.d.results)console.log(r.requestType,r.requestStatus.result?'OK':'ERR '+r.requestStatus.comment,JSON.stringify(r.responseData||{}).slice(0,300));process.exit(0)}};
setTimeout(()=>{console.log('timeout');process.exit(1)},10000);
