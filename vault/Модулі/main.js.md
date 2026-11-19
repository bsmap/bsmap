---
tags: [module, entrypoint]
file: js/main.js
---
# main.js

Точка входу. Викликає `init()` наприкінці файлу.

## `init()`
1. `applySavedSettings`, `syncSettingsToDom`, `initSettings` з [[settings-ui.js]].
2. `initStationList()` з [[stations.js]].
3. `initButtons()`: згортання панелі, «Видалити все» з `confirm`, undo/redo, збереження, завантаження й експорт. Гарячі клавіші Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z працюють поза полями вводу.
4. `initMapEvents()`: створення станції кліком.
5. `initSearch(...)` з [[geocoding.js]]: вибір результату пошуку додає станцію.
6. Відновлення станцій зі [[Стан у localStorage]] і перший `commit()`.

## Клік по карті
Клік ігнорується, якщо:
- щойно було перетягування (`isRecentlyDragged`);
- клікнули по контролу, інфобоксу чи кнопках;
- поруч (ближче 14 px на екрані) уже є станція.

Інакше: `reverseGeocode` (якщо увімкнено), `addStation`, виділення нової станції, `commit()`.
