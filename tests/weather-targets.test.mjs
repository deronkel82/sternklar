import test from 'node:test';
import assert from 'node:assert/strict';
import {targetWeatherHours} from '../weather.js';
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
