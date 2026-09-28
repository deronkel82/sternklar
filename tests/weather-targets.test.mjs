import test from 'node:test';
import assert from 'node:assert/strict';
import {targetWeatherHours,targetWeatherSamples} from '../weather.js';
import {curve} from '../charts.js';
function forecast(times,cloud,stale=false){return {stale,hourly:{time:times,cloud_cover:cloud,precipitation_probability:cloud.map(()=>0),precipitation:cloud.map(()=>0),temperature_2m:cloud.map(()=>12),dew_point_2m:cloud.map(()=>5),wind_gusts_10m:cloud.map(()=>6),visibility:cloud.map(()=>20000)}};}
const sample=(d,visible=true)=>({d:new Date(d),visible});
test('Weather window counts only visible target samples and matching favorable forecast hours across midnight',()=>{
 const target={points:[sample('2026-09-28T23:50:00Z',false),sample('2026-09-29T00:00:00Z'),sample('2026-09-29T00:10:00Z'),sample('2026-09-29T00:20:00Z'),sample('2026-09-29T00:30:00Z'),sample('2026-09-29T00:40:00Z')]};
 const wx=forecast(['2026-09-29T00:00','2026-09-29T01:00'],[10,95]);
 const result=targetWeatherHours(target,wx);
 assert.ok(Math.abs(result.hours-4/6)<1e-10);assert.ok(Math.abs(result.coveredHours-5/6)<1e-10);
});
test('Cloudy reported hours yield zero; stale, missing and incomplete models do not claim usability',()=>{
 const target={points:[sample('2026-09-29T00:00:00Z'),sample('2026-09-29T00:10:00Z')]};
 const wx=forecast(['2026-09-29T00:00'],[95]);assert.equal(targetWeatherHours(target,wx).hours,0);
 assert.equal(targetWeatherHours(target,{...wx,stale:true}),null);
 assert.equal(targetWeatherHours(target,forecast(['2026-09-30T00:00'],[0])),null);
 delete wx.hourly.dew_point_2m;assert.equal(targetWeatherHours(target,wx),null);
});
test('The colored window follows each visible sample and never bridges cloudy or unknown intervals',()=>{
 const points=[0,10,20,30,40].map(minute=>({...sample(`2026-09-29T00:${String(minute).padStart(2,'0')}:00Z`),alt:50,floor:20}));
 const target={name:'Testziel',points,hours:5/6,peak:{alt:50,d:points[0].d}};
 const wx=forecast(['2026-09-29T00:00','2026-09-29T01:00'],[10,95]);
 const samples=targetWeatherSamples(target,wx);
 assert.deepEqual(samples.map(s=>s.status),['good','good','good','good','poor']);
 const ctx={start:new Date('2026-09-28T12:00:00Z'),end:new Date('2026-09-29T12:00:00Z'),step:600000,dark:[],loc:{tz:'Europe/Berlin'}};
 const svg=curve(target,ctx,false,samples);
 assert.match(svg,/stroke="var\(--photo-weather\)"/);
 assert.match(svg,/stroke="var\(--muted\)" stroke-dasharray/);
 assert.match(svg,/>02:00<\/text>/);
 const stale=curve(target,ctx,false,targetWeatherSamples(target,{...wx,stale:true}));
 assert.doesNotMatch(stale,/stroke="var\(--photo-weather\)"/);
 assert.deepEqual(targetWeatherSamples(target,{...wx,stale:true}).map(s=>s.status),Array(5).fill('unknown'));
});
