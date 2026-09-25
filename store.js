import {currentNight,clamp} from './astro.js';
export const SCOPES=[
{id:'dwarf3',name:'DWARF 3',focal:150,pixel:2,px:3840,py:2160,aperture:35},
{id:'s50pro',name:'Seestar S50 Pro',focal:260,pixel:2.9,px:3840,py:2160,aperture:50},
{id:'s50',name:'Seestar S50',focal:250,pixel:2.9,px:1920,py:1080,aperture:50},
{id:'s30pro',name:'Seestar S30 Pro',focal:160,pixel:2.9,px:3840,py:2160,aperture:30},
{id:'s30',name:'Seestar S30',focal:150,pixel:2.9,px:1920,py:1080,aperture:30},
{id:'dwarf2',name:'DWARF II',focal:100,pixel:1.45,px:3840,py:2160,aperture:24},
{id:'mini',name:'DWARF Mini',focal:150,pixel:2,px:1920,py:1080,aperture:30},
{id:'vespera2',name:'Vespera II / III',focal:250,pixel:2.9,px:3840,py:2160,aperture:50},
{id:'originmk2',name:'Celestron Origin Mark II',focal:335,pixel:2,px:3856,py:2180,aperture:152},
{id:'vesperapro',name:'Vespera Pro',focal:250,pixel:2,px:3536,py:3536,aperture:50}];
export const DEFAULT_LOCATION={name:'Moers',lat:51.4516,lon:6.626,tz:'Europe/Berlin',horizon:Array(8).fill(0)};
export const defaults=()=>({version:1,location:structuredClone(DEFAULT_LOCATION),places:[],scopes:['dwarf3','s50pro'],customScopes:[],scope:'dwarf3',sky:2,filter:'none',minAltitude:20,moonAdapt:true,hideCaptured:false,redlight:false,textSize:100,units:'metric',wish:[],captured:{},plan:[],onboarded:false});
export function validTZ(tz){try{new Intl.DateTimeFormat('en',{timeZone:tz}).format();return typeof tz==='string';}catch{return false;}}
export function validLocation(l){return l&&typeof l.name==='string'&&Number.isFinite(l.lat)&&Math.abs(l.lat)<=90&&Number.isFinite(l.lon)&&Math.abs(l.lon)<=180&&validTZ(l.tz);}
export function sanitizeLocation(l){if(!validLocation(l))throw new Error('Ungültiger Standort oder ungültige Zeitzone.');return{name:l.name.slice(0,100),lat:l.lat,lon:l.lon,tz:l.tz,horizon:Array.from({length:8},(_,i)=>clamp(Number(l.horizon?.[i])||0,0,90))};}
export function validate(raw){if(!raw||raw.version!==1)throw new Error('Keine unterstützte Sternklar-Sicherung.');const s=defaults();s.location=sanitizeLocation(raw.location);s.places=(Array.isArray(raw.places)?raw.places:[]).slice(0,50).filter(validLocation).map(sanitizeLocation);
 s.customScopes=(Array.isArray(raw.customScopes)?raw.customScopes:[]).slice(0,30).filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&['focal','pixel','px','py','aperture'].every(k=>Number.isFinite(x[k])&&x[k]>0&&x[k]<100000)).map(x=>({...x,id:x.id.slice(0,50),name:x.name.slice(0,80)}));const ids=[...SCOPES,...s.customScopes].map(x=>x.id);s.scopes=(Array.isArray(raw.scopes)?raw.scopes:[]).filter(x=>ids.includes(x));if(!s.scopes.length)s.scopes=['dwarf3'];s.scope=s.scopes.includes(raw.scope)?raw.scope:s.scopes[0];
 for(const k of['moonAdapt','hideCaptured','redlight','onboarded'])if(typeof raw[k]==='boolean')s[k]=raw[k];s.sky=clamp(Math.round(Number(raw.sky)||0),0,3);s.minAltitude=clamp(Number.isFinite(raw.minAltitude)?raw.minAltitude:20,0,85);s.textSize=clamp(Number(raw.textSize)||100,85,140);s.units=raw.units==='imperial'?'imperial':'metric';s.filter=raw.filter==='dual'?'dual':'none';s.wish=[...new Set((Array.isArray(raw.wish)?raw.wish:[]).filter(x=>typeof x==='string'&&x.length<40))].slice(0,2000);
 if(raw.captured&&typeof raw.captured==='object'&&!Array.isArray(raw.captured))for(const [id,v]of Object.entries(raw.captured).slice(0,2000))if(typeof v==='object'&&v&&/^[A-Z][A-Za-z0-9 +.-]{0,39}$/.test(id))s.captured[id]={date:typeof v.date==='string'?v.date.slice(0,10):'',note:typeof v.note==='string'?v.note.slice(0,4000):''};
 s.plan=(Array.isArray(raw.plan)?raw.plan:[]).slice(0,200).filter(p=>p&&typeof p.id==='string').map(p=>({id:p.id.slice(0,40),scope:ids.includes(p.scope)?p.scope:s.scope,minutes:clamp(Number(p.minutes)||60,10,600)}));return s;}
// Keep the storage key stable across app releases. Data versions evolve separately.
export const DATA_KEY='sternklar-v1', BACKUP_KEY='sternklar-before-update';
export let storageIssue='';
let writesBlocked=false;
export function migrate(raw){
 // Add explicit, tested migration steps here before increasing the data version.
 // Never accept a future version by silently replacing it with defaults.
 return validate(raw);
}
export function load(){
 storageIssue='';writesBlocked=false;
 try{const raw=localStorage.getItem(DATA_KEY);return raw?migrate(JSON.parse(raw)):defaults();}
 catch{writesBlocked=true;storageIssue='Deine gespeicherten Daten konnten nicht sicher gelesen werden. Sie bleiben unverändert erhalten. Änderungen werden bis zur Wiederherstellung nicht gespeichert.';return defaults();}
}
export function save(state){
 if(writesBlocked)throw new Error(storageIssue);
 const current=localStorage.getItem(DATA_KEY);
 if(current)migrate(JSON.parse(current));
 localStorage.setItem(DATA_KEY,JSON.stringify(validate(state)));
}
export function checkpoint(){
 if(writesBlocked)throw new Error(storageIssue);
 const raw=localStorage.getItem(DATA_KEY);
 if(raw!==null){migrate(JSON.parse(raw));localStorage.setItem(BACKUP_KEY,raw);if(localStorage.getItem(BACKUP_KEY)!==raw)throw new Error('Sicherung fehlgeschlagen');}
}
export function restoreCheckpoint(){
 const raw=localStorage.getItem(BACKUP_KEY);if(!raw)throw new Error('Noch keine Update-Sicherung vorhanden.');
 const restored=migrate(JSON.parse(raw));
 const current=localStorage.getItem(DATA_KEY);
 if(current!==null)localStorage.setItem('sternklar-before-restore',current);
 localStorage.setItem(DATA_KEY,JSON.stringify(restored));writesBlocked=false;storageIssue='';return restored;
}
export function rawStoredData(){return localStorage.getItem(DATA_KEY)||'{}';}
export function getScope(state,id=state.scope){return [...SCOPES,...state.customScopes].find(s=>s.id===id)||SCOPES[0];}
export function exportData(state){return JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);}
export function sharePayload(state,date,ids){return{version:1,location:{...state.location,lat:Math.round(state.location.lat*100)/100,lon:Math.round(state.location.lon*100)/100},date,ids,scope:state.scope};}
export function encodePayload(data){return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(data)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
export function decodePayload(text){if(text.length>100000)throw new Error('Der Code ist zu lang.');return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))));}
export function parseShared(data,knownIds){if(data.version!==1||!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||!Number.isFinite(Date.parse(data.date))||new Date(data.date+'T12:00:00Z').toISOString().slice(0,10)!==data.date)throw new Error('Ungültiger Planlink.');return {...data,location:sanitizeLocation(data.location),ids:(Array.isArray(data.ids)?data.ids:[]).filter(x=>knownIds.includes(x)).slice(0,100)};}
export function mergeState(old,other){const s={...other,wish:[...new Set([...old.wish,...other.wish])],captured:{...old.captured,...other.captured},places:[...old.places,...other.places].filter((p,i,a)=>i===a.findIndex(x=>x.lat===p.lat&&x.lon===p.lon)),customScopes:[...old.customScopes,...other.customScopes].filter((p,i,a)=>i===a.findIndex(x=>x.id===p.id)),plan:[...old.plan,...other.plan].filter((p,i,a)=>i===a.findIndex(x=>x.id===p.id&&x.scope===p.scope))};return validate(s);}
