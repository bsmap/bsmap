---
tags: [module]
file: js/ui.js
---
# ui.js

| Функція | Призначення |
|---|---|
| `el(tag, attrs, ...children)` | створює елемент без `innerHTML`. `text` іде в `textContent`, `class` у `className`, `value` ставиться останнім (після `min/max/step`) |
| `textWithBreaks(text)` | багаторядковий текст → текстові вузли з `<br>` |
| `toast(message, type, ms)` | сповіщення внизу екрана (`info`, `warn`, `error`), контейнер з `aria-live` |

На цьому модулі тримається [[ADR-002 Вивід тексту без innerHTML]].
