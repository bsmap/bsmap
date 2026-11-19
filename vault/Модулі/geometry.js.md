---
tags: [module, pure, tested]
file: js/geometry.js
---
# geometry.js

Плоска наближена геометрія: рівнокутна проєкція, 111 320 м на градус. Точності вистачає для радіусів у кілометри. Азимут відраховується від півночі за годинниковою стрілкою.

| Функція | Призначення |
|---|---|
| `offsetLatLng(lat, lng, distance, bearing)` | точка на заданій відстані й азимуті |
| `bearingDegrees(lat, lng, lat2, lng2)` | азимут між точками (0–360), обернена до `offsetLatLng` |
| `calculatePopupPosition(lat, lng, azimuth, distance)` | інфобокс з протилежного від сектора боку |
| `sectorPoints(lat, lng, azimuth, radius, width)` | вершини сектора кроком 1°, кінець дуги завжди включений |
| `circlePoints(lat, lng, radius, n = 72)` | коло для ширини 360° в [[export.js]] |

Використовують: [[stations.js]] (полігони, [[Ручка азимута]]) і [[export.js]].
