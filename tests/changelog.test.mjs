import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {APP_VERSION,SEEN_KEY,RELEASES,unseenReleases,acknowledgeRelease,newer} from '../changelog.js';
function storage(entries=[]){const m=new Map(entries);return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};}
test('Existing installations see news once, without changing their data',()=>{
 const s=storage([['sternklar-v1','my existing data']]);assert.deepEqual(unseenReleases(s),[RELEASES[0]]);
 acknowledgeRelease(s);assert.deepEqual(unseenReleases(s),[]);assert.equal(s.getItem('sternklar-v1'),'my existing data');
});
test('Fresh installs establish a baseline; skipped versions appear newest first',()=>{
 const fresh=storage();assert.deepEqual(unseenReleases(fresh),[]);assert.equal(fresh.getItem(SEEN_KEY),APP_VERSION);
 const previous=storage([[SEEN_KEY,'1.2.2']]);assert.deepEqual(unseenReleases(previous).map(r=>r.version),['1.3.0','1.2.4','1.2.3']);assert.ok(newer('1.10.0','1.9.0'));
});
test('Older tabs do not overwrite newer acknowledgements and blocked storage cannot break startup',()=>{
 const future=storage([[SEEN_KEY,'2.0.0']]);acknowledgeRelease(future);assert.equal(future.getItem(SEEN_KEY),'2.0.0');assert.deepEqual(unseenReleases(future),[]);
 const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};assert.deepEqual(unseenReleases(blocked),[]);assert.doesNotThrow(()=>acknowledgeRelease(blocked));
});
test('Release metadata, app package and offline shell share the same version; changelog is deployed',()=>{
 assert.equal(RELEASES[0].version,APP_VERSION);
 assert.equal(JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url))).version,APP_VERSION);
 assert.ok(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8').includes('sternklar-shell-v'+APP_VERSION));
 assert.match(fs.readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8'),/cp .*changelog.js/);
});
