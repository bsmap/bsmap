// Скасування/повтор дій: стек знімків стану станцій.
// (Не називаємо `history`, щоб не затінити window.history.)

const UNDO_LIMIT = 100;
const undoStack = [];
let undoIndex = -1;

function updateHistoryButtons() {
    document.getElementById('undo').disabled = undoIndex <= 0;
    document.getElementById('redo').disabled = undoIndex >= undoStack.length - 1;
}

// Фіксує поточний стан як новий крок історії (якщо він змінився) і ставить автозбереження.
function commit() {
    const snapshot = JSON.stringify(serializeStations());
    if (snapshot !== undoStack[undoIndex]) {
        undoStack.length = undoIndex + 1; // відкидаємо «майбутнє» після скасування
        undoStack.push(snapshot);
        if (undoStack.length > UNDO_LIMIT) undoStack.shift();
        undoIndex = undoStack.length - 1;
    }
    updateHistoryButtons();
    scheduleSave();
}

function applySnapshot() {
    const list = JSON.parse(undoStack[undoIndex]).map(s => sanitizeStation(s, settings)).filter(Boolean);
    restoreStations(list);
    updateHistoryButtons();
    scheduleSave();
}

function undo() {
    if (undoIndex <= 0) return;
    undoIndex--;
    applySnapshot();
}

function redo() {
    if (undoIndex >= undoStack.length - 1) return;
    undoIndex++;
    applySnapshot();
}
