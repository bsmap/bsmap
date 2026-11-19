---
tags: [module, pure, tested]
file: js/validate.js
---
# validate.js

Чисті функції валідації. Без DOM, покриті [[Тести|тестами]].

| Функція / константа | Призначення |
|---|---|
| `MARKER_SIZES` | `[12, 16, 20, 25, 28, 32, 36, 40, 44]`: кроки повзунка розміру маркера |
| `HEX_COLOR` | `/^#[0-9a-f]{6}$/i` |
| `MAX_STATIONS` | 5000: ліміт станцій у файлі |
| `clamp(n, min, max)` | обмеження діапазоном |
| `finiteNumber(v)` | число або `NaN`; порожній рядок дає `NaN` |
| `markerSizeIndex(size)` / `markerSizeByIndex(idx)` | перетворення розмір ↔ позиція повзунка |
| `sanitizeStation(raw, defaults)` | приводить об'єкт до [[Модель станції]] або повертає `null` |
| `parseStationsFile(text, defaults)` | розбір [[Формат файлу JSON]], повертає `{stations, skipped}` |

## Правила `sanitizeStation`
- `lat` у межах [-90, 90], `lng` у межах [-180, 180]. Інакше вся станція відкидається.
- `azimuth`: `''` зберігається, сміття стає 0, решта обрізається до 0–360.
- `width`: `''` зберігається (сектор прихований), сміття стає значенням за замовчуванням.
- `radius` > 0, обрізається до 1–1 000 000 м.
- `markerSize` 4–100 px; `color` лише у форматі `#rrggbb`.
- `name` до 200 символів, `address` до 2000.
- `popupLat/popupLng` приймаються лише валідною парою, інакше `null` (позиція обчислюється заново).

Використовують: [[stations.js]], [[history.js]], [[storage.js]], [[settings-ui.js]], [[main.js]].
