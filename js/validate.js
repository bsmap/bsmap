// Чисті функції валідації та санітизації даних (без DOM) — покриті тестами.

const MARKER_SIZES = [12, 16, 20, 25, 28, 32, 36, 40, 44];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const MAX_STATIONS = 5000;

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

// Перетворює значення на скінченне число; порожній рядок і сміття дають NaN.
function finiteNumber(v) {
    if (typeof v === 'string' && v.trim() === '') return NaN;
    if (typeof v !== 'number' && typeof v !== 'string') return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}

// Індекс найближчого розміру маркера у MARKER_SIZES (для повзунка).
function markerSizeIndex(size) {
    let best = 0;
    let bestDiff = Infinity;
    MARKER_SIZES.forEach((s, i) => {
        const diff = Math.abs(s - size);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = i;
        }
    });
    return best;
}

function markerSizeByIndex(idx) {
    return MARKER_SIZES[idx] || MARKER_SIZES[0];
}

// Приводить довільний об'єкт до коректної станції або повертає null,
// якщо координати непридатні. `defaults` — значення за замовчуванням.
function sanitizeStation(raw, defaults) {
    if (!raw || typeof raw !== 'object') return null;

    const lat = finiteNumber(raw.lat);
    const lng = finiteNumber(raw.lng);
    if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) return null;

    let azimuth;
    if (raw.azimuth === '') {
        azimuth = '';
    } else {
        const a = finiteNumber(raw.azimuth);
        azimuth = Number.isNaN(a) ? 0 : clamp(a, 0, 360);
    }

    let width;
    if (raw.width === '') {
        width = '';
    } else {
        const w = finiteNumber(raw.width);
        width = Number.isNaN(w) ? defaults.AZIMUTH_WIDTH : clamp(w, 0, 360);
    }

    const r = finiteNumber(raw.radius);
    const radius = r > 0 ? clamp(r, 1, 1000000) : defaults.RADIUS;

    const ms = finiteNumber(raw.markerSize);
    const markerSize = ms > 0 ? clamp(ms, 4, 100) : defaults.MARKER_SIZE;

    const popupLat = finiteNumber(raw.popupLat);
    const popupLng = finiteNumber(raw.popupLng);
    const hasPopupPos = popupLat >= -90 && popupLat <= 90 && popupLng >= -180 && popupLng <= 180;

    return {
        name: typeof raw.name === 'string' ? raw.name.slice(0, 200) : '',
        lat,
        lng,
        azimuth,
        radius,
        width,
        color: typeof raw.color === 'string' && HEX_COLOR.test(raw.color) ? raw.color : defaults.COLOR,
        address: typeof raw.address === 'string' ? raw.address.slice(0, 2000) : '',
        markerSize,
        popupLat: hasPopupPos ? popupLat : null,
        popupLng: hasPopupPos ? popupLng : null
    };
}

// Розбирає вміст JSON-файлу. Приймає масив станцій (поточний формат)
// або об'єкт {stations: [...]}. Кидає Error для непридатного файлу.
function parseStationsFile(text, defaults) {
    let data = JSON.parse(text);
    if (data && !Array.isArray(data) && Array.isArray(data.stations)) data = data.stations;
    if (!Array.isArray(data)) throw new Error('Очікувався масив станцій');
    if (data.length > MAX_STATIONS) throw new Error(`Забагато станцій (максимум ${MAX_STATIONS})`);

    const stations = [];
    let skipped = 0;
    data.forEach(item => {
        const s = sanitizeStation(item, defaults);
        if (s) stations.push(s);
        else skipped++;
    });
    return { stations, skipped };
}
