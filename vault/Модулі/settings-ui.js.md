---
tags: [module]
file: js/settings-ui.js
---
# settings-ui.js

Панель [[Глобальні налаштування]].

- `applySavedSettings(saved)`: підставляє збережені значення з перевіркою діапазонів.
- `syncSettingsToDom()`: переносить значення `settings` у поля форми.
- `bindSetting(input, onInput)`: на `input` застосовує зміну і викликає `scheduleSave()`, на `change` викликає `commit()`.
- `forEachStation(fn)`: змінює всі станції й оновлює їхні картки.
- `initSettings()`: обробники для шрифту, кольору, розміру маркера, радіуса, ширини, відступу інфобокса, геокодування, жирного і курсиву.
