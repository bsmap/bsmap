---
tags: [module]
file: js/storage.js
---
# storage.js

| Функція | Призначення |
|---|---|
| `readSavedState()` | читає [[Стан у localStorage]], помилки ковтає |
| `writeSavedState()` / `scheduleSave()` | запис із debounce 300 мс, див. [[Автозбереження]] |
| `downloadFile(name, text, mime)` | завантаження файлу через Blob |
| `saveStationsFile()` | файл `base_stations.json` ([[Формат файлу JSON]]) |
| `exportGeoJSON()` / `exportKML()` | експорт через [[export.js]] |
| `loadStationsFile(file)` | `parseStationsFile` → `restoreStations` → `commit` → `fitBounds` → toast зі статистикою |

Також зберігає `currentBaseLayer`. Див. [[Імпорт і експорт]].
