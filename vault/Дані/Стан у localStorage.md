---
tags: [data, format]
---
# Стан у localStorage

Ключ: `bsmap.state.v1` (`STORAGE_KEY` у [[config.js]]).

```json
{
  "stations": [ /* як у файлі JSON */ ],
  "settings": { "AZIMUTH_WIDTH": 120, "RADIUS": 700, "COLOR": "#000000", "...": "..." },
  "view": { "lat": 50.45, "lng": 30.52, "zoom": 14 },
  "baseLayer": "Карта"
}
```

- `stations` мають той самий формат, що й [[Формат файлу JSON]], і при відновленні проходять ту саму санітизацію.
- `settings` перевіряються за діапазонами в `applySavedSettings` ([[settings-ui.js]]).
- `view` перевіряється в [[map.js]], некоректне значення замінюється на Київ.

Як очистити вручну: DevTools → Application → Local Storage → видалити `bsmap.state.v1`.

Див. також: [[Автозбереження]].
