---
tags: [module, pure, tested]
file: js/export.js
---
# export.js

Формує GeoJSON і KML з масиву станцій. Про формати: [[Імпорт і експорт]].

| Функція | Призначення |
|---|---|
| `stationLabel(s, i)` | назва, інакше адреса, інакше «Станція N» |
| `stationSectorRing(s)` | кільце сектора або кола; `null`, якщо `width === ''` |
| `toGeoJSON(list)` | `FeatureCollection`: точка (`kind: station`) і полігон (`kind: sector`), координати `[lng, lat]` |
| `escapeXml(str)` | екранування для KML |
| `kmlColor(hex, alpha)` | `#rrggbb` → `aabbggrr` |
| `toKML(list)` | документ KML зі стилем для кожної станції; заливка з альфою `4d` |

Залежить від [[geometry.js]]. Викликається з [[storage.js]].
