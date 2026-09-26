/* Astronomy calculations stay on the device. Angles: degrees, RA: hours. */
const A=globalThis.Astronomy;
export const DIRS=['N','NO','O','SO','S','SW','W','NW'];
export const PLANETS={Mercury:'Merkur',Venus:'Venus',Mars:'Mars',Jupiter:'Jupiter',Saturn:'Saturn',Uranus:'Uranus',Neptune:'Neptun'};
const rad=Math.PI/180;
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function dateInZone(d,tz){return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
export function shiftDate(date,days){return new Date(Date.parse(date+'T12:00:00Z')+days*864e5).toISOString().slice(0,10);}
export function zonedDate(date,hour,tz){
 const desired=Date.parse(date+`T${String(hour).padStart(2,'0')}:00:00Z`);let t=desired;
 for(let i=0;i<3;i++){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t)).map(p=>[p.type,p.value]));const actual=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);t+=desired-actual;}
 return new Date(t);
}
export function currentNight(tz){const d=new Date();let date=dateInZone(d,tz);const hour=+new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',hourCycle:'h23'}).format(d);return hour<12?shiftDate(date,-1):date;}
export function time(d,tz){return d?new Intl.DateTimeFormat('de-DE',{timeZone:tz,hour:'2-digit',minute:'2-digit'}).format(new Date(d)):'—';}
export function longDate(d,tz){return new Intl.DateTimeFormat('de-DE',{timeZone:tz,day:'numeric',month:'short',year:'numeric'}).format(new Date(d));}
export function observer(loc){return new A.Observer(loc.lat,loc.lon,loc.elevation||0);}
export function bodyAt(body,d,obs){const eq=A.Equator(body,d,obs,true,true);return {...A.Horizon(d,obs,eq.ra,eq.dec,'normal'),ra:eq.ra,dec:eq.dec};}
export function starEq(ra,dec,d,rot){const v=A.VectorFromSphere(new A.Spherical(dec,ra*15,1),d);return A.EquatorFromVector(A.RotateVector(rot||A.Rotation_EQJ_EQD(d),v));}
export function separation(a,b){return Math.acos(clamp(Math.sin(a.dec*rad)*Math.sin(b.dec*rad)+Math.cos(a.dec*rad)*Math.cos(b.dec*rad)*Math.cos((a.ra-b.ra)*15*rad),-1,1))/rad;}
export function floorAt(az,loc,min=20){const a=(az%360)/45, i=Math.floor(a),f=a-i,h=loc.horizon||Array(8).fill(0);return Math.max(min,(h[i%8]||0)*(1-f)+(h[(i+1)%8]||0)*f);}
export function nightContext(date,loc){
 const obs=observer(loc),start=zonedDate(date,12,loc.tz),end=zonedDate(shiftDate(date,1),12,loc.tz),step=10*60e3,samples=[];
 for(let ms=+start;ms<+end;ms+=step){const d=new Date(ms);samples.push({d,sun:bodyAt('Sun',d,obs).altitude,moon:bodyAt('Moon',d,obs)});}
 const minSun=Math.min(...samples.map(s=>s.sun));const threshold=minSun<=-18?-18:minSun<=-12?-12:minSun<=-6?-6:0;
 const dark=samples.filter(s=>s.sun<threshold);const mid=dark.length?dark[Math.floor(dark.length/2)].d:new Date((+start+ +end)/2);
 const phase=A.MoonPhase(mid),illum=A.Illumination('Moon',mid).phase_fraction;
 let sunTimes={};for(const [key,alt,dir]of[['sunset',-.833,-1],['civil',-6,-1],['nautical',-12,-1],['darkStart',-18,-1],['darkEnd',-18,1],['sunrise',-.833,1]]){const found=A.SearchAltitude('Sun',obs,dir,start,(end-start)/864e5,alt);sunTimes[key]=found?.date||null;}
 const rise=A.SearchRiseSet('Moon',obs,1,start,(end-start)/864e5)?.date||null,set=A.SearchRiseSet('Moon',obs,-1,start,(end-start)/864e5)?.date||null;
 const rotation=A.Rotation_EQJ_EQD(mid);
 return {date,loc,obs,start,end,step,samples,dark,threshold,mid,phase,illum,rotation,sunTimes,moonRise:rise,moonSet:set,darkHours:dark.length*step/36e5,moonFree:dark.filter(s=>s.moon.altitude<=0).length*step/36e5};
}
export function fov(scope){return {w:2*Math.atan(scope.px*scope.pixel/1000/(2*scope.focal))/rad*60,h:2*Math.atan(scope.py*scope.pixel/1000/(2*scope.focal))/rad*60};}
// Allow 20% framing reserve around the catalogued extent. Unknown sizes
// cannot establish that a mosaic is useful; this is geometry, not device control.
export function mosaicUseful(t,scope){const fit=fitTarget(t,scope);return Number.isFinite(fit.ratio)&&fit.ratio<1.25;}
export function fitTarget(t,scope){const f=fov(scope);if(!t.major)return {ratio:null,label:'Größe unbekannt',f};const a=t.major,b=t.minor||a;const ratio=Math.max(Math.min(f.w/a,f.h/b),Math.min(f.w/b,f.h/a));return {ratio,label:ratio<1?'Mosaik nötig':ratio<1.25?'Knapp im Bild':ratio>12?'Sehr kleines Motiv':'Passt ins Bild',f};}
export function analyze(t,ctx,scope,settings={}){
 const eq=starEq(t.ra,t.dec,ctx.mid,ctx.rotation),min=settings.minAltitude??20,fit=fitTarget(t,scope),points=[],windows=[];let open=null,minMoon=180;
 for(const s of ctx.samples){const h=A.Horizon(s.d,ctx.obs,eq.ra,eq.dec,'normal'),floor=floorAt(h.azimuth,ctx.loc,min);const fraction=(s.d-ctx.start)/(ctx.end-ctx.start);const visible=s.sun<ctx.threshold&&h.altitude>=floor&&fraction>=(settings.windowStart??0)&&fraction<(settings.windowEnd??1);const p={d:s.d,alt:h.altitude,az:h.azimuth,floor,visible};points.push(p);if(visible){if(open===null)open=s.d;if(s.moon.altitude>0)minMoon=Math.min(minMoon,separation(eq,s.moon));}else if(open!==null){windows.push({start:open,end:s.d});open=null;}}
 if(open!==null)windows.push({start:open,end:ctx.end});
 const valid=points.filter(p=>p.visible);const peak=(valid.length?valid:points).reduce((a,b)=>a.alt>b.alt?a:b);const hours=valid.length*ctx.step/36e5;
 const moonPenalty=settings.moonAdapt===false?0:ctx.illum*(t.emission&&settings.filter==='dual'?7:22)*(1-ctx.moonFree/(ctx.darkHours||1))+Math.max(0,40-minMoon)*.65;
 const skyPenalty=(settings.sky??2)*(t.emission&&settings.filter==='dual'?1.5:t.group==='Galaxie'||t.type==='RfN'||t.type==='DrkN'?5:2);
 const fitPenalty=fit.ratio===null?8:fit.ratio<1?12:fit.ratio>12?15:fit.ratio>6?5:0;
 const score=hours===0?0:Math.round(clamp(30+Math.min(hours,5)*7+Math.max(0,peak.alt)*.35+(t.easy?7:0)-moonPenalty-skyPenalty-fitPenalty,1,99));
 return {...t,eq,points,windows,peak,hours,score,fit,minMoon,moonPenalty,dir:DIRS[Math.round(peak.az/45)%8]};
}
export function planetInfo(ctx){return Object.entries(PLANETS).map(([body,name])=>{const samples=ctx.samples.filter(s=>s.sun<-6).map(s=>({...bodyAt(body,s.d,ctx.obs),d:s.d}));const best=samples.reduce((a,b)=>!a||a.altitude<b.altitude?b:a,null);return {body,name,best,illum:A.Illumination(body,ctx.mid),elongation:A.AngleFromSun(body,ctx.mid)};});}
// Standard annual shower radiants and typical ZHR; year-to-year outbursts are not forecast.
const showers=[['Quadrantiden',283.15,230,49,80,2.1,41],['Lyriden',32.32,271,34,18,2.1,49],['Eta-Aquariiden',45.5,338,-1,50,2.4,66],['Alpha-Capricorniden',128,307,-10,5,2.5,23],['Südliche Delta-Aquariiden',128,340,-16,25,2.5,41],['Perseiden',140,48,58,100,2.2,59],['Draconiden',195.4,263,56,5,2.6,20],['Orioniden',208,95,16,20,2.5,66],['Südliche Tauriden',223,52,15,7,2.3,27],['Nördliche Tauriden',230,58,22,5,2.3,29],['Leoniden',235.27,152,22,15,2.5,71],['Puppid-Veliden',255,123,-45,10,2.9,44],['Geminiden',262.2,112,33,150,2.6,35],['Ursiden',270.7,217,76,10,2.8,33]];
export function meteorEvents(ctx,sky){const year=+ctx.date.slice(0,4),events=[];for(const y of[year,year+1])for(const[name,sol,ra,dec,zhr,r,speed]of showers){const peak=A.SearchSunLongitude((sol+50.2877*(y-2000)/3600)%360,new Date(`${y}-01-01T00:00:00Z`),370)?.date;if(!peak||peak<new Date(+ctx.start-3*864e5)||peak>new Date(+ctx.start+370*864e5))continue;let d=dateInZone(peak,ctx.loc.tz);const c=nightContext(d,ctx.loc);const eq=starEq(ra/15,dec,c.mid,c.rotation);const best=c.dark.map(s=>{const h=A.Horizon(s.d,c.obs,eq.ra,eq.dec,'normal');const moonLoss=s.moon.altitude>0?c.illum*1.7:0;const lm=[6.5,6,5.2,4.4][sky];return{d:s.d,alt:h.altitude,rate:zhr*Math.max(0,Math.sin(h.altitude*rad))/Math.pow(r,6.5-lm+moonLoss)};}).sort((a,b)=>b.rate-a.rate)[0];events.push({kind:'Meteorstrom',name,peak,zhr,speed,best});}return events.sort((a,b)=>a.peak-b.peak).slice(0,6);}
export function events(ctx){const out=[],end=+ctx.start+370*864e5;let q=A.SearchMoonQuarter(ctx.start);for(let i=0;i<8;i++){out.push({kind:'Mondphase',name:['Neumond','Erstes Viertel','Vollmond','Letztes Viertel'][q.quarter],d:q.time.date});q=A.NextMoonQuarter(q);}
 for(const body of['Mars','Jupiter','Saturn','Uranus','Neptune']){const d=A.SearchRelativeLongitude(body,0,ctx.start).date;if(+d<end)out.push({kind:'Opposition',name:PLANETS[body],d,alt:bodyAt(body,d,ctx.obs).altitude});}
 for(const body of['Mercury','Venus']){const e=A.SearchMaxElongation(body,ctx.start);out.push({kind:'Größte Elongation',name:PLANETS[body]+` · ${e.elongation.toFixed(1)}°`,d:e.time.date,alt:bodyAt(body,e.time.date,ctx.obs).altitude});}
 const se=A.Seasons(+ctx.date.slice(0,4));for(const[key,name]of[['mar_equinox','Tagundnachtgleiche'],['jun_solstice','Sonnenwende'],['sep_equinox','Tagundnachtgleiche'],['dec_solstice','Sonnenwende']])if(se[key].date>=ctx.start)out.push({kind:'Jahreszeit',name,d:se[key].date});
 const lunar=A.SearchLunarEclipse(ctx.start);if(+lunar.peak.date<end)out.push({kind:'Mondfinsternis',name:({total:'Total',partial:'Partiell',penumbral:'Halbschatten'})[lunar.kind]||lunar.kind,d:lunar.peak.date,alt:bodyAt('Moon',lunar.peak.date,ctx.obs).altitude});
 const solar=A.SearchLocalSolarEclipse(ctx.start,ctx.obs);if(+solar.peak.time.date<end)out.push({kind:'Sonnenfinsternis',name:`Lokal · ${(solar.obscuration*100).toFixed(0)} % bedeckt`,d:solar.peak.time.date,alt:solar.peak.altitude});
 // Closest nightly Moon/planet approaches over the next month; explicitly sampled, not exact conjunction instants.
 for(const body of Object.keys(PLANETS)){let prev=null,prev2=null;for(let n=0;n<33;n++){const d=new Date(+ctx.mid+n*864e5);const m=bodyAt('Moon',d,ctx.obs),p=bodyAt(body,d,ctx.obs),sep=separation(m,p);if(prev2&&prev.sep<prev2.sep&&prev.sep<=sep&&prev.sep<7)out.push({kind:'Mondbegegnung · Nacht-Näherung',name:`Mond & ${PLANETS[body]} · ${prev.sep.toFixed(1)}°`,d:prev.d,alt:Math.min(prev.m.altitude,prev.p.altitude)});prev2=prev;prev={d,sep,m,p};}}
 return out.sort((a,b)=>a.d-b.d).slice(0,22);
}
export function weatherQuality(row){const cloud=row.cloud_cover,rain=row.precipitation_probability,dew=row.temperature_2m-row.dew_point_2m;let score=100-cloud*.9-Math.max(0,(row.wind_gusts_10m||0)-12)*1.3-Math.max(0,3-dew)*6-Math.max(0,15000-(row.visibility??15000))/1500;if(rain>20)score-=rain*.5;if(row.precipitation>0)score=Math.min(score,15);return Math.round(clamp(score,0,100));}
