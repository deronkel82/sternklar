# TonightPlan – Recherche und Umsetzung

Recherche: 24. September 2026. Grundlage: die verlinkte Live-Web-App, ihre öffentlich ausgelieferte Oberfläche und Funktionsstruktur sowie die öffentlich verfügbare Beschreibung des Videos „Stop Wasting Clear Nights Deciding What to Image“ (19.09.2026). Das Video wurde nicht vollständig als Bild/Ton ausgewertet; eine Video-Transkription liegt nicht vor.

Quellen:
- https://tonightplan.cosmiccaptures.com/
- https://www.youtube.com/watch?v=y_9leiOOKck
- https://zolotube.com/watch?v=y_9leiOOKck (öffentlich indizierte Videobeschreibung)

## Funktionsabgleich

| Bereich der Vorlage | In Sternklar |
|---|---|
| Standort per GPS, Stadtsuche, Karte | Implementiert; zusätzlich direkte Koordinaten und prüfbare IANA-Zeitzone |
| Gespeicherte Standorte und örtlicher Horizont | Implementiert; acht interpolierte Sektoren, kein künstliches Drei-Plätze-Limit |
| Smart-Teleskop-Presets und eigene Kamera-/Optikdaten | Implementiert; neun Presets plus eigene Setups; mehrere aktive Geräte |
| Persönliche Kurzliste für Standort, Gerät, Himmel und Mond | Eigene transparente Bewertung anhand Höhe, Dauer, Mond, Himmel und Bildfeld |
| Deep-Sky-Katalog mit Suche, Richtung, Typ, Katalog und Einsteigerfilter | Implementiert; 476 Ziele, Messier-/Caldwell-Filter, Eignungsgrenzen |
| Sortierung nach Wirkung, Größe, Timing | Eignung ersetzt persönliche Wirkungsbewertung; Größe, Kulminationszeit, Katalognummer |
| Wechsel zwischen heutiger Sichtbarkeit und Gesamtbestand | Implementiert |
| Beliebige Planungsnacht und einschränkbare Aufnahmezeit | Implementiert; 1900–2100, lokale Nacht über Mitternacht, Teilfenster |
| Dunkelheit, Dämmerung, Mondphase/-aufgang/-untergang | Implementiert; auch fehlende astronomische Nacht/Polartag klar behandelt |
| Höhenverlauf, Spitzenhöhe, Zeitfenster, Mondabstand | Implementiert; 10-Minuten-Raster und Hindernisse |
| Objekt passt / enges Bildfeld / Mosaik | Implementiert mit beiden Achsen und günstiger Kameraorientierung |
| Aufsuchkarte, Sternbilder, Beschriftung und Feldgröße | Implementiert; Ganzhimmel und gnomonische 5°/15°/30°-Aufsuchkarte |
| Originale Beispielbilder, Galerien und persönliche Aufnahmetexte | Bewusste Abweichung: unabhängige DSS2-Surveybilder und eigene sachliche Hinweise; keine fremden Fotos/Galerien kopiert |
| Merkliste und bereits aufgenommene Ziele | Implementiert; zusätzlich Datums-/Textnotizen |
| Nachtwetter: Wolken, Schichten, Tau, Sichtweite, Böen, Regen | Implementiert, nur dunkle Stunden; gecacht, Abrufzeit und Fehlerstatus |
| Wochenvorschau | Implementiert, sieben lokal definierte Nächte |
| Kalender: Planeten, Oppositionen, Elongationen, Begegnungen, Finsternisse, Jahreszeiten | Implementiert; lokale Höhe; Mondbegegnungen ausdrücklich nächtliche Näherung |
| Meteorströme, lokale geschätzte Raten und günstige Uhrzeit | Implementiert für 14 bedeutende jährliche Ströme; keine vollständige IMO-Arbeitsliste / Ausbruchsvorhersage |
| Monatlich redaktionelle Himmelsführungen und Kauf-/Supportlinks | Nicht reproduziert: redaktionelle Inhalte und Finanzierung des Autors, keine Planungsberechnung |
| Rotlicht, Schriftgröße, Einheiten | Implementiert |
| Offline-Nutzung inklusive Bilder | App/Katalog/Berechnungen offline; Wunsch-/Planzielbilder optional herunterladen |
| Export/Import/Transfercode ohne Konto | Implementiert; Validierung, Vorschau, Zusammenführen/Ersetzen |
| Geteilte Ziele und kompletter Plan | Implementiert; gerundete Koordinaten und lokale Importbestätigung |
| Quellen und Privatsphäre | In App und Repository dokumentiert |

## Eigenständige UX-Verbesserungen

Vier Hauptbereiche: Heute Nacht, Entdecken, Mein Plan, Einstellungen. Teleskopwechsel ohne erneutes Onboarding. Höhere Touch-Ziele, native Eingaben, passende Dialoge, Safe Areas und lokal gespeicherte Einstellungen. Nachvollziehbare Fehler-/Offlinezustände statt leerer Ergebnisse. Aus „merken“ wird auf Wunsch ein konkreter Zeitplan mit Aufnahmedauer, fünf Minuten Wechselpuffer und parallelen Geräten. Export im iCalendar-Format.

## Parität ehrlich eingeordnet

Dies ist eine eigenständige Umsetzung der zentralen Planungsfunktionen, **keine bitgenaue oder vollständig inhaltsgleiche Kopie**. Persönliche Bildbewertungen, alle Fotos, redaktionelle Monatstexte und die exakte Zielauswahl der Vorlage sind nicht reproduziert. Die Kalenderauswahl und Meteorstromliste sind bewusst begrenzt; sämtliche Näherungen sind im Produkt gekennzeichnet. Der recherchierte Funktionsabgleich dokumentiert diese Unterschiede, statt uneingeschränkte Funktionsgleichheit zu behaupten.
