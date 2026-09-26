import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {defaults,load,save,migrate,checkpoint,restoreCheckpoint,DATA_KEY,BACKUP_KEY} from '../store.js';
function storage(){const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};load();return map;}
test('Existing v1 data survives release load, checkpoint and restoration including zero altitude',()=>{
 const map=storage(),s=defaults();s.minAltitude=0;s.wish=['M31'];s.plan=[{id:'M31',scope:'dwarf3',minutes:120}];s.captured.M31={date:'2026-09-25',note:'Meine Aufnahme 🌌'};s.location.horizon=[1,2,3,4,5,6,7,8];
 map.set(DATA_KEY,JSON.stringify(s));assert.deepEqual(load(),s);checkpoint();assert.equal(map.get(BACKUP_KEY),JSON.stringify(s));
 const changed={...s,wish:['M42']};save(changed);assert.deepEqual(restoreCheckpoint(),s);assert.equal(map.get('sternklar-before-restore'),JSON.stringify(changed));assert.deepEqual(load(),s);
});
test('Corrupt and future data cannot be overwritten by fallback defaults or checkpoint',()=>{
 for(const raw of ['{broken',JSON.stringify({...defaults(),version:999})]){const map=storage();map.set(DATA_KEY,raw);load();assert.throws(()=>save(defaults()));assert.throws(()=>checkpoint());assert.equal(map.get(DATA_KEY),raw);assert.equal(map.get(BACKUP_KEY),undefined);}
});
test('Quota failure leaves source intact and refuses an update checkpoint',()=>{
 const map=storage();save(defaults());const raw=map.get(DATA_KEY);globalThis.localStorage.setItem=()=>{throw new Error('QuotaExceeded');};assert.throws(()=>checkpoint());assert.equal(map.get(DATA_KEY),raw);
});
test('Future-format writes from another tab are protected',()=>{const map=storage();const raw=JSON.stringify({...defaults(),version:2});map.set(DATA_KEY,raw);assert.throws(()=>save(defaults()));assert.equal(map.get(DATA_KEY),raw);assert.throws(()=>migrate({version:2}));});
test('Service worker waits for consent and removes only outdated Sternklar shell caches',async()=>{
 const handlers={},deleted=[];let skips=0;const self={addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>skips++,clients:{claim:async()=>{}}};
 vm.runInNewContext(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{self,caches:{keys:async()=>['sternklar-shell-v1.0.0','sternklar-shell-v1.2.4','sternklar-images-v1','other-app'],delete:async k=>deleted.push(k)}});
 assert.equal(skips,0);let pending;handlers.message({data:{type:'OTHER'},waitUntil:p=>pending=p});assert.equal(skips,0);handlers.message({data:{type:'SKIP_WAITING'},waitUntil:p=>pending=p});await pending;assert.equal(skips,1);handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['sternklar-shell-v1.0.0']);
});
test('Every shell asset exists and new updater is deployed',()=>{const source=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');const assets=source.match(/const ASSETS=(\[[^;]+\])/)[1];for(const asset of JSON.parse(assets.replaceAll("'",'"')))assert.ok(fs.existsSync(new URL('../'+asset,import.meta.url)),asset);assert.match(fs.readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8'),/cp .*updates.js/);});
function updateHarness({waiting=true,fail=false}={}){
 const events={},documentEvents={},windowEvents={},classes=new Set(),now={},later={},status={};let checkpoints=0,reloads=0,activations=0;
 const box={hidden:true,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},setAttribute(){},querySelector:s=>s==='[data-update-now]'?now:s==='[data-update-later]'?later:status,remove(){}};
 const worker={postMessage:()=>activations++};const reg={waiting:waiting?worker:null,installing:null,addEventListener(){},update:async()=>{}};
 const context={navigator:{onLine:true,serviceWorker:{controller:{},register:async()=>reg,addEventListener:(n,f)=>events[n]=f}},document:{visibilityState:'visible',createElement:()=>box,querySelector:()=>({after(){}}),addEventListener:(n,f)=>documentEvents[n]=f},window:{addEventListener:(n,f)=>windowEvents[n]=f},location:{reload:()=>reloads++},setInterval(){},setTimeout(){},clearTimeout(){},checkpoint:()=>{checkpoints++;if(fail)throw new Error('quota');}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../updates.js',import.meta.url),'utf8').replace(/^import .*\n/,'').replaceAll('export async function','async function'),context);
 return{context,reg,box,now,later,status,classes,events,documentEvents,windowEvents,stats:()=>({checkpoints,reloads,activations})};
}
test('Already waiting update persists, Later minimizes, returning offers again, consent checkpoints before activation',async()=>{const h=updateHarness();await h.context.setupUpdates();assert.equal(h.box.hidden,false);h.later.onclick();assert.ok(h.classes.has('compact'));h.documentEvents.visibilitychange();assert.ok(!h.classes.has('compact'));assert.equal(h.stats().activations,0);h.now.onclick();assert.deepEqual(h.stats(),{checkpoints:1,reloads:0,activations:1});h.events.controllerchange();assert.equal(h.stats().reloads,1);});
test('Failed checkpoint blocks activation and other tabs never reload without consent',async()=>{const h=updateHarness({fail:true});await h.context.setupUpdates();h.now.onclick();assert.equal(h.stats().activations,0);assert.match(h.status.textContent,/nicht gespeichert/);h.events.controllerchange();assert.equal(h.stats().reloads,0);});
test('Installing a release bypasses cached HTTP responses for every app asset',async()=>{const handlers={};let pending,requests;const self={location:{href:'https://example.org/sternklar/sw.js'},addEventListener:(n,f)=>handlers[n]=f};vm.runInNewContext(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{self,URL,Request,caches:{open:async()=>({addAll:async r=>{requests=r;}})}});handlers.install({waitUntil:p=>pending=p});await pending;assert.ok(requests.length>15);assert.ok(requests.every(r=>r.cache==='reload'));assert.ok(requests.some(r=>r.url.endsWith('/updates.js')));});

test('Manual update check reports current, offline and network errors without reloading',async()=>{
 const h=updateHarness({waiting:false});await h.context.setupUpdates();await h.context.checkForUpdates();
 assert.equal(h.box.hidden,false);assert.match(h.status.textContent,/bereits die aktuelle Version/);assert.equal(h.now.hidden,true);
 h.context.navigator.onLine=false;await h.context.checkForUpdates();assert.match(h.status.textContent,/offline/);
 h.context.navigator.onLine=true;h.reg.update=async()=>{throw new Error('network');};await h.context.checkForUpdates();assert.match(h.status.textContent,/fehlgeschlagen/);
 assert.deepEqual(h.stats(),{checkpoints:0,reloads:0,activations:0});
});
test('Manual update check offers waiting release and still requires install consent',async()=>{
 const h=updateHarness();await h.context.setupUpdates();await h.context.checkForUpdates();assert.equal(h.now.hidden,false);assert.match(h.status.textContent,/neue Version/);assert.equal(h.stats().activations,0);
 h.now.onclick();h.events.controllerchange();assert.deepEqual(h.stats(),{checkpoints:1,reloads:1,activations:1});
});

test('No-update and error messages close completely and disappear on navigation',async()=>{
 const h=updateHarness({waiting:false});await h.context.setupUpdates();await h.context.checkForUpdates();
 assert.equal(h.later.textContent,'Schließen');h.later.onclick();assert.equal(h.box.hidden,true);
 await h.context.checkForUpdates();assert.equal(h.box.hidden,false);h.windowEvents.hashchange();assert.equal(h.box.hidden,true);
 h.context.navigator.onLine=false;await h.context.checkForUpdates();h.windowEvents.hashchange();assert.equal(h.box.hidden,true);
});
test('Navigation during checking does not resurrect a status message, but a real update remains accessible',async()=>{
 const h=updateHarness({waiting:false});await h.context.setupUpdates();let finish;h.reg.update=()=>new Promise(r=>finish=r);
 const pending=h.context.checkForUpdates();h.windowEvents.hashchange();finish();await pending;assert.equal(h.box.hidden,true);
 h.reg.update=async()=>{};h.reg.waiting={postMessage(){}};await h.context.checkForUpdates();h.windowEvents.hashchange();assert.equal(h.box.hidden,false);assert.equal(h.later.textContent,'Später');assert.equal(h.now.hidden,false);
});
