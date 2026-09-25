import {checkpoint} from './store.js';

// Updates are offered persistently; activation always follows an explicit click.
export async function setupUpdates(){
 if(!('serviceWorker' in navigator))return;
 const box=document.createElement('aside');box.className='update-banner';box.hidden=true;box.setAttribute('aria-label','App-Update');
 box.innerHTML='<div><strong>Ein Update ist bereit</strong><p role="status">Deine gespeicherten Daten bleiben erhalten. Schließe offene Eingaben vor dem Aktualisieren ab.</p></div><div class="tool-row"><button class="primary" data-update-now>Jetzt aktualisieren</button><button data-update-later>Später</button></div>';
 document.querySelector('.topbar').after(box);
 const now=box.querySelector('[data-update-now]'),later=box.querySelector('[data-update-later]'),status=box.querySelector('[role="status"]');
 const hadController=!!navigator.serviceWorker.controller;
 let registration,reloading=false,requested=false,changed=false,timeout;
 const offer=()=>{if(registration?.waiting||changed){box.hidden=false;box.classList.remove('compact');later.hidden=false;}};
 later.onclick=()=>{box.classList.add('compact');later.hidden=true;};
 now.onclick=()=>{
  try{checkpoint();}catch{status.textContent='Die Sicherung vor dem Update konnte nicht gespeichert werden. Bitte sichere deine Daten unter Einstellungen → Datei sichern. Das Update wurde nicht gestartet.';box.classList.remove('compact');return;}
  if(changed){location.reload();return;}
  const worker=registration?.waiting;if(!worker){status.textContent='Das Update wird noch vorbereitet. Bitte versuche es gleich erneut.';return;}
  requested=true;now.disabled=true;later.disabled=true;status.textContent='Sicherung erstellt. Update wird aktiviert …';
  worker.postMessage({type:'SKIP_WAITING'});
  timeout=setTimeout(()=>{requested=false;now.disabled=false;later.disabled=false;status.textContent='Die Aktivierung dauert länger. Bitte versuche es erneut.';},15000);
 };
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(!hadController&&!requested)return;
  changed=true;
  if(requested&&!reloading){reloading=true;clearTimeout(timeout);location.reload();}
  else if(registration){status.textContent='Eine neue Version ist aktiv. Lade diese Ansicht neu, sobald deine Eingaben abgeschlossen sind.';offer();}
 });
 try{
  registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const watch=worker=>{if(!worker)return;const inspect=()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offer();};worker.addEventListener('statechange',inspect);inspect();};
  registration.addEventListener('updatefound',()=>watch(registration.installing));watch(registration.installing);offer();
  const check=()=>{offer();if(navigator.onLine)registration.update().catch(()=>{});};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
  window.addEventListener('online',check);
  setInterval(()=>{if(document.visibilityState==='visible')check();},60*60*1000);
  check();
 }catch{box.remove();}
}
