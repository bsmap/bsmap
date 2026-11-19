---
tags: [module]
file: js/config.js
---
# config.js

- `settings`: глобальні налаштування, див. [[Глобальні налаштування]].
- `STORAGE_KEY = 'bsmap.state.v1'`: ключ для [[Стан у localStorage]].
- `POPUP_MIN_WIDTH = 150`, `POPUP_MAX_WIDTH = 250`: межі ширини інфобокса.

> [!note]
> Якщо змінюється структура збереженого стану, змінюйте суфікс ключа (`v2`), щоб старий стан не ламав завантаження.
