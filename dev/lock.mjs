// Chiffre {host, pass} avec le code d'équipe (PBKDF2-SHA256 → AES-GCM), même format que le navigateur
import {webcrypto as c} from 'node:crypto';
const [code,host,pass]=process.argv.slice(2);
const enc=new TextEncoder(),b64=b=>Buffer.from(b).toString('base64');
const salt=c.getRandomValues(new Uint8Array(16)),iv=c.getRandomValues(new Uint8Array(12)),it=600000;
const base=await c.subtle.importKey('raw',enc.encode(code.trim().toLowerCase()),'PBKDF2',false,['deriveKey']);
const key=await c.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt']);
const ct=await c.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify({host,pass})));
console.log(JSON.stringify({v:1,s:b64(salt),i:it,iv:b64(iv),ct:b64(new Uint8Array(ct))}));
