---
tags: [module]
file: js/history.js
---
# history.js

Реалізує [[Скасування і повтор]] через знімки стану, див. [[ADR-004 Історія через знімки стану]].

- `undoStack`: рядки JSON з `serializeStations()`, не більше `UNDO_LIMIT = 100`.
- `commit()`: додає знімок, якщо він відрізняється від поточного. Відкидає «майбутнє» після undo, оновлює кнопки і викликає `scheduleSave()`.
- `undo()` / `redo()` викликають `applySnapshot()`: санітизація, потім `restoreStations()`.

Змінна називається `undoStack`, а не `history`, щоб не затінити `window.history`.
