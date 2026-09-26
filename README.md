# Sternklar

Deutschsprachige, installierbare Astroplaner-PWA für iPhone, iPad und Desktop. Statische Anwendung für GitHub Pages, ohne Backend oder Benutzerkonto.

## Funktionen

- 476 Deep-Sky-Ziele mit allen 110 Messier-Einträgen; M102 ist als umstrittene Zuordnung zu NGC 5866 gekennzeichnet.
- Standortsuche, GPS, Kartenwahl, eigene Koordinaten und Zeitzone, gespeicherte Plätze.
- Acht individuell einstellbare Horizontsektoren; Mindesthöhe; eigenes Aufnahmezeitfenster.
- Lokale astronomische Berechnung mit Astronomy Engine: Sonne, Dämmerung, Mond, Höhenkurven, sichtbare Zeitfenster, Mondabstand, Planeten und Ereignisse.
- Teleskopprofile, eigene Setups und maßstäblicher Sichtfeldvergleich. Zwei Geräte können parallel geplant werden.
- Stündliches Nachtwetter mit drei Wolkenschichten, Temperatur, Taupunkt, Wind/Böen, Regen und Sichtweite; sieben Nächte Vorschau.
- Filter, Suche, Merkliste, Aufnahmehistorie mit Notizen, automatisch ergänzter Nachtplan und Kalenderexport.
- Interaktive Stern- und Aufsuchkarten, optionale DSS2-Surveybilder und Offline-Bildspeicherung.
- Lokale Datensicherung, Transfercode, validierter Import mit Vorschau und Zusammenführen/Ersetzen; teilbare Ziele und Pläne.
- Rotlichtmodus, skalierbare Schrift, metrische/imperiale Einheiten, Safe-Area-Layout und Offline-App-Shell.

Die vollständige Recherche und die Unterschiede zur Vorlage stehen in [FEATURES.md](FEATURES.md).

## Starten

Die auszuliefernde App benötigt **keinen Build** und keine npm-Laufzeitabhängigkeiten:

```sh
python3 -m http.server 4173
```

Danach `http://localhost:4173` öffnen. Für Entwicklung mit Hot Reload:

```sh
npm ci
npm run dev
```

Im Vite-Entwicklungsmodus wird kein Service Worker registriert, damit Änderungen sofort sichtbar werden. Die ausgelieferte statische Version verwendet ihn regulär.

## GitHub Pages

1. Öffentliches Repository `sternklar` im gewünschten Konto erstellen und diese Dateien auf `main` pushen.
2. Unter Settings → Pages als Source **GitHub Actions** wählen.
3. Der enthaltene Workflow `.github/workflows/pages.yml` testet und veröffentlicht die statischen Dateien. Er kann unter Actions auch manuell gestartet werden.

Alle Asset- und Service-Worker-Pfade sind relativ und funktionieren unter einem Repository-Unterpfad. Bei einer neuen Auslieferung mit geänderten Dateien die `SHELL`-Versionskennung in `sw.js` erhöhen. Ein wartendes Update wird nach Schließen der alten App-Fenster aktiv.

## Auf iPhone / iPad installieren

Die veröffentlichte HTTPS-Seite in Safari öffnen → Teilen → Zum Home-Bildschirm → als Web-App öffnen. Einmal vollständig laden lassen. Unter Einstellungen → Offline-Verfügbarkeit den Zustand prüfen und bei Bedarf gemerkte Bilder speichern.

## Tests

```sh
npm test
```

Die Tests benötigen nur Node.js, keine npm-Installation. Sie prüfen Zeitzonen, Sommerzeit, Polartag/-nacht, Südhimmel, Horizontsperren, Bildfelder, Katalogvollständigkeit, Ereignisse und Importvalidierung. `qa/responsive.html` dient ausschließlich dem Entwicklungstest verschiedener Bildschirmbreiten und wird nicht mit veröffentlicht.

## Daten, Genauigkeit und Grenzen

- Berechnungen in UTC, Darstellung in der Zeitzone des Beobachtungsortes; eine Nacht reicht von Mittag bis Mittag.
- Objektfenster: 10-Minuten-Raster, J2000-Koordinaten mit Präzession/Nutation auf den Beobachtungszeitpunkt. Keine Behauptung sekundengenauer Deep-Sky-Fenster.
- Punktzahlen sind eine eigene nachvollziehbare Heuristik. Keine Übernahme von TonightPlans persönlichen Bewertungen.
- Meteoraktivität: typische Jahresmaxima und geschätzte lokale Raten, keine Ausbruchsvorhersage. Mondbegegnungen: nächtlich abgetastete Näherungen.
- Weather API: Open-Meteo kostenlos für nichtkommerzielle Nutzung. Netzwerkausfälle und veraltete Prognosen werden gekennzeichnet. Eine präzise Seeing-Prognose wird nicht behauptet.
- Surveybilder sind Orientierungshilfen und nicht repräsentativ für Ergebnisse der eigenen Ausrüstung. Es wurden keine Fotos, Texte oder proprietären Algorithmen der Vorlage kopiert.
- Daten bleiben im Browser. Browser-/Betriebssystembereinigung kann lokale Daten entfernen: Sicherungen exportieren.
- Keine Gerätesteuerung, kein Cloud-Sync, keine Hintergrund-Wetterbenachrichtigungen.

## Lizenzen

Eigener Anwendungscode: MIT, siehe LICENSE. Astronomiebibliothek und Leaflet: mitgelieferte Lizenzen in `vendor/`. Der bearbeitete OpenNGC-Katalog bleibt CC BY-SA 4.0. Sterne und Konstellationslinien stammen aus D3-Celestial (Olaf Frohn); dessen Quellen nennen XHIP (Anderson & Francis 2012) und IAU-Konstellationen. Attributionen und Datenquellen: [data/SOURCES.md](data/SOURCES.md).

## Sichere Updates (1.1)

Der persistente Hinweis erkennt neu installierte und bereits wartende Service Worker. „Später“ verkleinert ihn; bei erneuter Sichtbarkeit wird er wieder aufgeklappt. Prüfung beim Start, bei Rückkehr in die App, nach Wiederherstellung der Verbindung und stündlich im Vordergrund. „Jetzt aktualisieren“ prüft den aktuellen gespeicherten Stand, schreibt eine separate lokale Sicherung und aktiviert erst danach die neue Version. Andere offene Fenster werden nicht ungefragt neu geladen. Offene Formulare vor dem Update abschließen.

Der Nutzerdatenschlüssel `sternklar-v1` bleibt unabhängig von der App-Version stabil. Datenformat 1 bleibt unverändert; spätere Formate benötigen explizite Migrationen in `migrate()` mit Regressionstests. Nicht lesbare oder unbekannte Formate blockieren Schreibzugriffe, statt Originaldaten zu ersetzen. Unter Einstellungen können Originaldaten exportiert und die letzte Update-Sicherung wiederhergestellt werden; auch vor einer Wiederherstellung wird der vorhandene Rohstand separat erhalten. Lokale Sicherungen ersetzen keine exportierte Datei und schützen nicht vor gelöschten Browserdaten.

Bei jedem Release muss die Shell-Version in `sw.js` erhöht werden. Beim erstmaligen Wechsel von 1.0 auf 1.1 gilt noch der alte Hinweis: alle Sternklar-Fenster schließen und neu öffnen, damit der neue Update-Dialog geladen wird.

## Mosaikfilter (1.2)
Unter Entdecken lässt sich „Mosaik sinnvoll“ aktivieren. Der Filter nutzt das aktive Teleskop und kombiniert sich mit Sichtbarkeit, Suche und den anderen Filtern. Er zeigt Objekte, die bei günstiger Ausrichtung größer als ein Einzelbild sind oder weniger als 20 % Reserve im Bildfeld lassen (Bildfeld/Objekt-Verhältnis < 1,25). Unbekannte Größen werden ausgeschlossen. Diese geometrische Empfehlung sagt nicht aus, ob die Hersteller-App einen automatischen Mosaikmodus unterstützt.
