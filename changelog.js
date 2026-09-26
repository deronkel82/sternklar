export const APP_VERSION='1.3.0';
export const SEEN_KEY='sternklar-changelog-seen';
export const RELEASES=[
 {version:'1.3.0',title:'Neuigkeiten immer im Blick',changes:['Die Versionshistorie ist jetzt in den Einstellungen unter „Was ist neu? / Changelog“ erreichbar.','Nach einem Update erscheinen die Neuigkeiten einmalig. Nach dem Schließen bleiben sie in der Versionshistorie nachlesbar.']},
 {version:'1.2.4',title:'Alle Teleskope im Bildfeldvergleich',changes:['„Passt es in dein Bild?“ zeigt alle ausgewählten Teleskope und eigenen Setups.','Eine separate Legende mit Bildfeldmaßen, Farben und Linienmustern erleichtert den Vergleich.']},
 {version:'1.2.3',title:'Update-Meldungen schließen',changes:['Reine Statusmeldungen lassen sich vollständig schließen und verschwinden beim Seitenwechsel.']},
 {version:'1.2.2',title:'Update-Veröffentlichung korrigiert',changes:['Ein Ladefehler der Version 1.2.1 wurde behoben.']},
 {version:'1.2.1',title:'Updates auf Knopfdruck',changes:['Ein fester Button in den Einstellungen prüft auf Updates und meldet den aktuellen Stand.','Verfügbare Updates lassen sich direkt aktivieren, ohne die App schließen zu müssen.']},
 {version:'1.2.0',title:'Ziele für Mosaike finden',changes:['Der Filter „Mosaik sinnvoll“ berücksichtigt das Bildfeld des aktiven Teleskops und die Objektgröße.']},
 {version:'1.1.1',title:'Ältere Installationen aktualisieren',changes:['Ein separater Update-Assistent hilft bei festhängenden älteren Versionen.','Neue App-Dateien werden beim Update frisch geladen.']},
 {version:'1.1.0',title:'Sichere Updates und Origin Mark II',changes:['Update-Hinweise mit bewusster Aktivierung und lokaler Sicherung der gespeicherten Daten.','Sicherung wiederherstellen und Originaldaten exportieren.','Celestron Origin Mark II als Teleskopprofil ergänzt.']},
 {version:'1.0.0',title:'Sternklar startet',changes:['Astroplanung mit Deep-Sky-Katalog, Nachtfenstern, Mond, Wetter und persönlichem Horizont.','Teleskopauswahl, Bildfeldvergleich, Merklisten, Aufnahmen und Aufnahmepläne.','Installierbare Home-Screen-App mit Offline-Katalog und Datensicherung.']}
];
export function newer(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;}
export function unseenReleases(storage){
 try{
  const seen=storage.getItem(SEEN_KEY);
  if(!seen){if(storage.getItem('sternklar-v1')!==null)return [RELEASES[0]];acknowledgeRelease(storage);return [];}
  if(!/^\d+\.\d+\.\d+$/.test(seen))return [RELEASES[0]];
  return RELEASES.filter(r=>newer(r.version,seen));
 }catch{return [];}
}
export function acknowledgeRelease(storage){try{const seen=storage.getItem(SEEN_KEY);if(!seen||!/^\d+\.\d+\.\d+$/.test(seen)||newer(APP_VERSION,seen))storage.setItem(SEEN_KEY,APP_VERSION);}catch{/* Storage restrictions must not block the app. */}}
