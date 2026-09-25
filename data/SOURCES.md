# Data and attribution

## Deep-sky catalogue
`catalog.json` is a selected and transformed database derived from OpenNGC, Mattia Verga and contributors: https://github.com/mattiaverga/OpenNGC . Inputs: `database_files/NGC.csv` and `database_files/addendum.csv`, retrieved 2026-09-24. Licensed CC BY-SA 4.0; see OpenNGC-LICENSE. Changes: selection of 476 entries, normalized identifiers, numeric coordinate conversion, translated common names, Caldwell cross-identifications, computed group/category flags. The derivative database remains CC BY-SA 4.0. M102 is conventionally represented by NGC5866 with an explicit disputed-identification label.

## Stars and constellation lines
`stars.json`: positions and magnitude <= 5 subset of D3-Celestial `data/stars.6.json` by Olaf Frohn. Its upstream source is XHIP: An Extended Hipparcos Compilation; Anderson E., Francis C. (2012), VizieR V/137D. Coordinates converted from signed degrees to RA hours. `constellations.json`: D3-Celestial `data/constellations.lines.json`, IAU-based constellations with modifications by Olaf Frohn. Upstream: https://github.com/ofrohn/d3-celestial . See Celestial-LICENSE (BSD).

## Astronomy
Astronomy Engine by Don Cross, MIT: https://github.com/cosinekitty/astronomy . Vendored browser bundle fetched 2026-09-24. Original license preserved in vendor/ASTRONOMY-LICENSE. Reference: https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md .

## Weather and geocoding
Open-Meteo, https://open-meteo.com/ and https://open-meteo.com/en/docs . Weather data CC BY 4.0. Free endpoint is intended for noncommercial use; production commercial deployments require reviewing their current terms. Geocoding is backed by GeoNames. No secret API key is embedded.

## Optional map
Leaflet 1.9.4, BSD-2-Clause, vendor/Leaflet-LICENSE. Map data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright . Tiles fetched on demand, not preloaded or downloaded for bulk offline use.

## Optional survey images
CDS HiPS2FITS service: https://alasky.cds.unistra.fr/hips-image-services/hips2fits ; DSS2 color survey. Digitized Sky Survey produced at the Space Telescope Science Institute under U.S. Government grant NAG W-2166, based on photographic data from the Oschin Schmidt Telescope on Palomar Mountain and the UK Schmidt Telescope. Plates processed into digital form with permission of those institutions. DSS2 images are orientation aids and not personal equipment examples. No TonightPlan image has been copied or bundled.

## Meteor showers
International Meteor Organization calendars: https://www.imo.net/resources/calendar/ . Typical ZHR, radiants, population indices and J2000 solar longitudes for common annual streams. Local displayed rates are simplified estimates, not guarantees or outburst predictions; moonlight and sky brightness reduce them. The annual peak is computed with Astronomy Engine and an approximate precession correction.

## Hardware profiles
ZWO Seestar product specifications: https://www.seestar.com/ ; DWARFLAB: https://www.dwarflab.com/ ; Vaonis: https://vaonis.com/ . Sensor size is represented through pixel pitch and active image dimensions; native field orientation may differ from the landscape comparison. Profile values can be replaced with an individual custom setup.
