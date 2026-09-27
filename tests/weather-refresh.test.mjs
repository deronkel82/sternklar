import test from 'node:test';
import assert from 'node:assert/strict';
import {weather} from '../weather.js';
const loc={lat:51.45,lon:6.62};
const hourly={time:['2026-09-27T22:00'],cloud_cover:[20]};
function prepare(){const old={at:Date.now()-5000,hourly,key:'sternklar-wx-51.5-6.6'},map=new Map([[old.key,JSON.stringify(old)]]);globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};return{old,map};}
test('Manual refresh bypasses both recent local forecast and HTTP cache, and updates fetch time',async()=>{
 const {old}=prepare();let count=0,options;globalThis.fetch=async(url,opts)=>{count++;options=opts;return{ok:true,json:async()=>({hourly})};};
 const cached=await weather(loc);assert.equal(count,0);assert.equal(cached.at,old.at);
 const fresh=await weather(loc,true);assert.equal(count,1);assert.equal(options.cache,'no-store');assert.ok(fresh.at>old.at);assert.equal(fresh.stale,false);
});
test('Failed refresh preserves cached values and their original time, clearly marked stale',async()=>{
 const {old}=prepare();globalThis.fetch=async()=>{throw new Error('offline');};const fallback=await weather(loc,true);
 assert.equal(fallback.stale,true);assert.equal(fallback.at,old.at);assert.deepEqual(fallback.hourly,hourly);
});
test('HTTP errors and malformed forecasts never replace a valid stored forecast',async()=>{
 for(const response of [{ok:false,status:429},{ok:true,json:async()=>({})}]){const {old,map}=prepare();globalThis.fetch=async()=>response;const fallback=await weather(loc,true);assert.equal(fallback.stale,true);assert.equal(JSON.parse(map.get(old.key)).at,old.at);}
});
