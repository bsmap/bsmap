// Модель станцій, їх відображення на карті та список у бічній панелі.

const stations = [];
let nextStationId = 1;
let selectedId = null;
let azimuthHandle = null;
let isRecentlyDragged = false;

function flagRecentDrag() {
    isRecentlyDragged = true;
    setTimeout(() => { isRecentlyDragged = false; }, 300); // не створювати станцію кліком після перетягування
}

function getStation(id) {
    return stations.find(s => s.id === id);
}

// ---- Іконки ----
function createMarkerIcon(color, size) {
    const dot = el('div', { class: 'marker-dot' }, el('div', { class: 'marker-dot-inner' }));
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.background = color;
    dot.firstChild.style.width = `${Math.round(size / 2)}px`;
    dot.firstChild.style.height = `${Math.round(size / 2)}px`;
    return L.divIcon({
        className: 'custom-marker',
        html: dot,
        iconSize: [size, size],
        iconAnchor: [Math.round(size / 2), Math.round(size / 2)]
    });
}

function applyPopupFont(node) {
    node.style.fontSize = `${settings.FONT_SIZE}px`;
    node.style.fontWeight = settings.FONT_WEIGHT;
    node.style.fontStyle = settings.FONT_STYLE;
}

function measureTextWidth(lines) {
    const probe = el('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;';
    applyPopupFont(probe);
    lines.forEach((line, i) => {
        if (i > 0) probe.append(document.createElement('br'));
        probe.append(document.createTextNode(line));
    });
    document.body.append(probe);
    const width = probe.offsetWidth;
    probe.remove();
    return width;
}

function createPopupIcon(s) {
    const box = el('div', { class: 'info-box' });
    applyPopupFont(box);
    box.style.borderColor = s.color;
    box.style.opacity = '1';
    box.style.lineHeight = 'normal';
    box.style.minWidth = '100px';
    box.style.maxWidth = `${POPUP_MAX_WIDTH}px`;
    box.style.textAlign = 'left';

    const lines = [];
    if (s.name) {
        box.append(el('div', { class: 'info-name', text: s.name }));
        lines.push(s.name);
    }
    const addressLines = (s.address || '').split(/\r?\n/);
    box.append(el('div', {}, textWithBreaks(s.address || '')));
    lines.push(...addressLines);
    if (s.azimuth !== '' && s.azimuth != null) {
        const text = `Азимут: ${s.azimuth}`;
        box.append(el('div', { text }));
        lines.push(text);
    }

    const width = clamp(measureTextWidth(lines) + 20, POPUP_MIN_WIDTH, POPUP_MAX_WIDTH);
    box.style.width = `${width}px`;

    return L.divIcon({
        html: box,
        className: 'info-box-container',
        iconSize: null,
        iconAnchor: [width / 2, 0]
    });
}

// ---- Відображення однієї станції ----
function renderMarker(s) {
    s.marker.setIcon(createMarkerIcon(s.color, s.markerSize));
}

function renderPopup(s) {
    s.popupMarker.setIcon(createPopupIcon(s));
}

function createAzimuthPolygon(lat, lng, azimuth, radius, width, color) {
    const style = { color, fillColor: color, weight: 1, interactive: false };
    if (width >= 360) {
        return L.circle([lat, lng], Object.assign({ radius, fillOpacity: 0.3 }, style));
    }
    return L.polygon(sectorPoints(lat, lng, azimuth, radius, width), Object.assign({ fillOpacity: 0.2 }, style));
}

function renderPolygon(s) {
    if (s.polygon) map.removeLayer(s.polygon);
    s.polygon = null;
    if (s.width === '') return; // порожня ширина — сектор прихований
    s.polygon = createAzimuthPolygon(s.lat, s.lng, s.azimuth === '' ? 0 : s.azimuth, s.radius, s.width, s.color)
        .addTo(map);
}

function resetPopupPosition(s) {
    const p = calculatePopupPosition(s.lat, s.lng, s.azimuth, settings.POPUP_DISTANCE);
    s.popupLat = p.lat;
    s.popupLng = p.lng;
    s.popupMarker.setLatLng([p.lat, p.lng]);
}

// ---- Створення та видалення ----
function addStation(data) {
    const s = Object.assign({ id: nextStationId++, marker: null, polygon: null, popupMarker: null }, data);

    s.marker = L.marker([s.lat, s.lng], {
        draggable: true,
        keyboard: false,
        icon: createMarkerIcon(s.color, s.markerSize)
    }).addTo(map);

    if (s.popupLat == null || s.popupLng == null) {
        const p = calculatePopupPosition(s.lat, s.lng, s.azimuth, settings.POPUP_DISTANCE);
        s.popupLat = p.lat;
        s.popupLng = p.lng;
    }

    s.popupMarker = L.marker([s.popupLat, s.popupLng], {
        icon: createPopupIcon(s),
        draggable: true,
        keyboard: false,
        zIndexOffset: 1000
    }).addTo(map);

    renderPolygon(s);
    bindStationEvents(s);
    stations.push(s);
    return s;
}

function bindStationEvents(s) {
    let popupOffset = null;

    s.marker.on('click', () => selectStation(s.id, { scroll: true }));

    s.marker.on('dragstart', () => {
        popupOffset = [s.popupLat - s.lat, s.popupLng - s.lng];
    });
    s.marker.on('drag', e => {
        const { lat, lng } = e.target.getLatLng();
        s.lat = lat;
        s.lng = lng;
        if (popupOffset) { // інфобокс їде разом зі станцією
            s.popupLat = lat + popupOffset[0];
            s.popupLng = lng + popupOffset[1];
            s.popupMarker.setLatLng([s.popupLat, s.popupLng]);
        }
        renderPolygon(s);
        refreshHandle(s);
    });
    s.marker.on('dragend', () => {
        flagRecentDrag();
        updateCoords(s);
        commit();
    });

    s.popupMarker.on('drag', e => {
        const { lat, lng } = e.target.getLatLng();
        s.popupLat = lat;
        s.popupLng = lng;
    });
    s.popupMarker.on('dragend', () => {
        flagRecentDrag();
        commit();
    });
}

function removeStationLayers(s) {
    [s.marker, s.polygon, s.popupMarker].forEach(layer => { if (layer) map.removeLayer(layer); });
}

function deleteStation(id) {
    const i = stations.findIndex(s => s.id === id);
    if (i === -1) return;
    removeStationLayers(stations[i]);
    stations.splice(i, 1);
    if (selectedId === id) selectedId = null;
    refreshHandle();
    updateStationList();
}

function clearStations() {
    stations.forEach(removeStationLayers);
    stations.length = 0;
    selectedId = null;
    refreshHandle();
}

// Замінює всі станції переданими (вже санітизованими) даними.
function restoreStations(list) {
    clearStations();
    list.forEach(addStation);
    updateStationList();
}

function serializeStations() {
    return stations.map(s => ({
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        azimuth: s.azimuth,
        radius: s.radius,
        width: s.width,
        color: s.color,
        address: s.address,
        markerSize: s.markerSize,
        popupLat: s.popupLat,
        popupLng: s.popupLng
    }));
}

function newStationData(lat, lng, address = '') {
    return sanitizeStation({
        lat, lng,
        azimuth: 0,
        radius: settings.RADIUS,
        width: settings.AZIMUTH_WIDTH,
        color: settings.COLOR,
        address,
        markerSize: settings.MARKER_SIZE
    }, settings);
}

function duplicateStation(id) {
    const src = getStation(id);
    if (!src) return;
    const d = 0.0003; // ~30 м
    const data = serializeStations()[stations.indexOf(src)];
    data.lat += d;
    data.lng += d;
    data.popupLat += d;
    data.popupLng += d;
    if (data.name) data.name += ' (копія)';
    const copy = addStation(data);
    updateStationList();
    selectStation(copy.id, { scroll: true });
}

// ---- Вибір станції та ручка азимута ----
function selectStation(id, { scroll = false } = {}) {
    selectedId = id;
    document.querySelectorAll('.station-item').forEach(item => {
        const selected = Number(item.dataset.id) === id;
        item.classList.toggle('selected', selected);
        if (selected && scroll) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    refreshHandle();
}

function handlePosition(s) {
    return offsetLatLng(s.lat, s.lng, s.radius, s.azimuth);
}

// Оновлює (або створює/прибирає) ручку азимута виділеної станції.
// Якщо передано `s` іншої станції — нічого не робить.
function refreshHandle(s) {
    if (s && s.id !== selectedId) return;
    const sel = getStation(selectedId);

    if (!sel || sel.azimuth === '') {
        if (azimuthHandle) map.removeLayer(azimuthHandle);
        azimuthHandle = null;
        return;
    }
    const pos = handlePosition(sel);
    if (azimuthHandle) {
        azimuthHandle.setLatLng([pos.lat, pos.lng]);
        return;
    }
    azimuthHandle = L.marker([pos.lat, pos.lng], {
        draggable: true,
        keyboard: false,
        zIndexOffset: 2000,
        title: 'Потягніть, щоб змінити азимут',
        icon: L.divIcon({ className: 'azimuth-handle', iconSize: [14, 14], iconAnchor: [7, 7] })
    }).addTo(map);

    azimuthHandle.on('drag', e => {
        const target = getStation(selectedId);
        if (!target) return;
        const p = e.target.getLatLng();
        target.azimuth = Math.round(bearingDegrees(target.lat, target.lng, p.lat, p.lng)) % 360;
        renderPolygon(target);
        renderPopup(target);
        updateListValues(target);
    });
    azimuthHandle.on('dragend', () => {
        const target = getStation(selectedId);
        if (target) {
            const p = handlePosition(target);
            azimuthHandle.setLatLng([p.lat, p.lng]);
        }
        flagRecentDrag();
        commit();
    });
}

// ---- Список у бічній панелі ----
function itemSelector(id, field) {
    return `.station-item[data-id="${id}"] [data-field="${field}"]`;
}

function updateCoords(s) {
    const node = document.querySelector(`.station-item[data-id="${s.id}"] .coords`);
    if (node) node.textContent = `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`;
}

// Синхронізує поля списку зі станом станції (після змін ззовні: ручка, глобальні налаштування).
function updateListValues(s) {
    const set = (field, value) => {
        const input = document.querySelector(itemSelector(s.id, field));
        if (input && document.activeElement !== input) input.value = value;
    };
    set('azimuth', s.azimuth);
    set('radius', s.radius);
    set('width', s.width);
    set('color', s.color);
    set('markerSize', markerSizeIndex(s.markerSize));
    const label = document.querySelector(`.station-item[data-id="${s.id}"] .marker-size-value`);
    if (label) label.textContent = s.markerSize;
}

function createStationListItem(s) {
    const fid = field => `st${s.id}-${field}`;
    const row = (field, label, input) => [el('label', { for: fid(field), text: label }), input];
    const input = (field, attrs) => el('input', Object.assign({ id: fid(field), 'data-field': field }, attrs));

    const item = el('div', { class: 'station-item', 'data-id': s.id },
        el('div', { class: 'station-header' },
            input('name', { type: 'text', value: s.name, placeholder: 'Назва станції', 'aria-label': 'Назва станції', maxlength: 200 }),
            el('div', { class: 'coords', text: `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}` })
        ),
        el('textarea', {
            id: fid('address'), 'data-field': 'address', class: 'address-input',
            placeholder: 'Адреса', 'aria-label': 'Адреса', maxlength: 2000, value: s.address || ''
        }),
        row('radius', 'Радіус (м):', input('radius', { type: 'number', min: 1, value: s.radius })),
        row('azimuth', 'Азимут (0-360):', input('azimuth', { type: 'number', min: 0, max: 360, value: s.azimuth })),
        row('width', 'Ширина (0-360):', input('width', { type: 'number', min: 0, max: 360, value: s.width })),
        row('color', 'Колір:', input('color', { type: 'color', value: s.color })),
        el('label', { for: fid('markerSize') }, 'Розмір маркера: ',
            el('span', { class: 'marker-size-value', text: s.markerSize }), ' px'),
        input('markerSize', {
            type: 'range', min: 0, max: MARKER_SIZES.length - 1, step: 1,
            value: markerSizeIndex(s.markerSize), style: 'width:100%;'
        }),
        el('div', { class: 'station-actions' },
            el('button', { type: 'button', 'data-action': 'duplicate', text: 'Дублювати' }),
            el('button', { type: 'button', 'data-action': 'delete', class: 'delete-button', text: 'Видалити' })
        )
    );
    if (s.id === selectedId) item.classList.add('selected');
    return item;
}

function updateStationList() {
    const list = document.getElementById('station-list');
    // Нові станції зверху
    list.replaceChildren(...stations.slice().reverse().map(createStationListItem));
    document.getElementById('station-count').textContent = stations.length;
    applyStationFilter();
}

function applyStationFilter() {
    const q = document.getElementById('station-filter').value.trim().toLowerCase();
    document.querySelectorAll('#station-list .station-item').forEach(item => {
        const s = getStation(Number(item.dataset.id));
        const hay = s ? `${s.name} ${s.address}`.toLowerCase() : '';
        item.hidden = q !== '' && !hay.includes(q);
    });
}

// ---- Редагування полів списку ----
function showInvalid(input, message, previous) {
    input.value = previous;
    toast(message, 'warn');
}

function handleListInput(e, committed) {
    const input = e.target;
    const field = input.dataset.field;
    const item = input.closest('.station-item');
    if (!field || !item) return;
    const s = getStation(Number(item.dataset.id));
    if (!s) return;
    let changed = true;

    switch (field) {
        case 'name':
            s.name = input.value;
            renderPopup(s);
            break;
        case 'address':
            s.address = input.value;
            renderPopup(s);
            break;
        case 'azimuth': {
            if (input.value === '') { // порожнє значення дозволене: азимут не показується
                s.azimuth = '';
                renderPopup(s);
                refreshHandle(s);
                break;
            }
            const n = finiteNumber(input.value);
            if (!(n >= 0 && n <= 360)) {
                showInvalid(input, 'Азимут має бути в діапазоні від 0 до 360 градусів.', s.azimuth);
                changed = false;
                break;
            }
            s.azimuth = n;
            renderPolygon(s);
            renderPopup(s);
            refreshHandle(s);
            break;
        }
        case 'radius': {
            const n = finiteNumber(input.value);
            if (!(n > 0)) { changed = false; break; }
            s.radius = clamp(n, 1, 1000000);
            renderPolygon(s);
            refreshHandle(s);
            break;
        }
        case 'width': {
            if (input.value === '') {
                s.width = '';
                renderPolygon(s);
                break;
            }
            const n = finiteNumber(input.value);
            if (!(n >= 0 && n <= 360)) {
                showInvalid(input, 'Ширина азимуту має бути в діапазоні від 0 до 360 градусів.', s.width);
                changed = false;
                break;
            }
            s.width = n;
            renderPolygon(s);
            break;
        }
        case 'color':
            if (!HEX_COLOR.test(input.value)) { changed = false; break; }
            s.color = input.value;
            renderMarker(s);
            renderPolygon(s);
            renderPopup(s);
            break;
        case 'markerSize':
            s.markerSize = markerSizeByIndex(parseInt(input.value, 10));
            renderMarker(s);
            item.querySelector('.marker-size-value').textContent = s.markerSize;
            break;
        default:
            changed = false;
    }
    if (committed && changed) commit();
}

function initStationList() {
    const list = document.getElementById('station-list');
    list.addEventListener('input', e => handleListInput(e, false));
    list.addEventListener('change', e => handleListInput(e, true));
    list.addEventListener('focusin', e => {
        const item = e.target.closest('.station-item');
        if (item) selectStation(Number(item.dataset.id));
    });
    list.addEventListener('click', e => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = Number(btn.closest('.station-item').dataset.id);
        if (btn.dataset.action === 'delete') {
            deleteStation(id);
            commit();
        } else if (btn.dataset.action === 'duplicate') {
            duplicateStation(id);
            commit();
        }
    });
    document.getElementById('station-filter').addEventListener('input', applyStationFilter);
}
