---
tags: [module, external-api]
file: js/geocoding.js
---
# geocoding.js

Робота з Nominatim. Поведінка описана в [[Пошук і геокодування]], обґрунтування в [[ADR-003 Черга запитів до Nominatim]].

| Функція / константа | Призначення |
|---|---|
| `NOMINATIM_MIN_INTERVAL = 1100` | мінімум мс між запитами |
| `SEARCH_DEBOUNCE = 700` | мс після введення до запиту |
| `nominatimRequest(path, params, signal)` | усі запити йдуть через спільний ланцюжок Promise |
| `reverseGeocode(lat, lng)` | адреса з `state, county, city/town/village, road, house_number`. Кеш за 5 знаками після коми. При помилці повертає `''` і показує toast |
| `setGeocodeIndicator(delta)` | лічильник активних запитів для спінера |
| `initSearch(onPick)` | поле пошуку: debounce, Enter шукає одразу, Esc закриває, `AbortController` скасовує застарілі запити |
