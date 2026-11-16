// Глобальні налаштування в бічній панелі: застосовуються до всіх станцій.

const DOM = {
    fontSize: document.getElementById('default-font-size'),
    color: document.getElementById('default-color'),
    bold: document.getElementById('default-bold'),
    italic: document.getElementById('default-italic'),
    radius: document.getElementById('default-radius'),
    width: document.getElementById('default-width'),
    popupDistance: document.getElementById('default-popup-distance'),
    geocode: document.getElementById('default-geocode'),
    markerSize: document.getElementById('default-marker-size'),
    markerSizeValue: document.getElementById('default-marker-size-value')
};

// Підставляє збережені налаштування, відкидаючи значення поза межами.
function applySavedSettings(saved) {
    if (!saved || typeof saved !== 'object') return;
    const inRange = (v, min, max) => { const n = finiteNumber(v); return n >= min && n <= max ? n : undefined; };
    const pick = (key, value) => { if (value !== undefined) settings[key] = value; };

    pick('FONT_SIZE', inRange(saved.FONT_SIZE, 6, 20));
    pick('RADIUS', inRange(saved.RADIUS, 1, 1000000));
    pick('POPUP_DISTANCE', inRange(saved.POPUP_DISTANCE, 50, 500));
    pick('MARKER_SIZE', inRange(saved.MARKER_SIZE, 4, 100));
    if (saved.AZIMUTH_WIDTH === '') settings.AZIMUTH_WIDTH = '';
    else pick('AZIMUTH_WIDTH', inRange(saved.AZIMUTH_WIDTH, 0, 360));
    if (typeof saved.COLOR === 'string' && HEX_COLOR.test(saved.COLOR)) settings.COLOR = saved.COLOR;
    if (saved.FONT_WEIGHT === 'bold') settings.FONT_WEIGHT = 'bold';
    if (saved.FONT_STYLE === 'italic') settings.FONT_STYLE = 'italic';
    if (typeof saved.GEOCODE === 'boolean') settings.GEOCODE = saved.GEOCODE;
}

function syncSettingsToDom() {
    DOM.fontSize.value = settings.FONT_SIZE;
    DOM.color.value = settings.COLOR;
    DOM.bold.checked = settings.FONT_WEIGHT === 'bold';
    DOM.italic.checked = settings.FONT_STYLE === 'italic';
    DOM.radius.value = settings.RADIUS;
    DOM.width.value = settings.AZIMUTH_WIDTH;
    DOM.popupDistance.value = settings.POPUP_DISTANCE;
    DOM.geocode.checked = settings.GEOCODE;
    DOM.markerSize.value = markerSizeIndex(settings.MARKER_SIZE);
    DOM.markerSizeValue.textContent = settings.MARKER_SIZE;
}

// Застосовує функцію до кожної станції та оновлює відповідні поля списку.
function forEachStation(fn) {
    stations.forEach(s => {
        fn(s);
        updateListValues(s);
    });
    refreshHandle();
}

function bindSetting(input, onInput) {
    input.addEventListener('input', e => { e.stopPropagation(); onInput(e); scheduleSave(); });
    input.addEventListener('change', e => { e.stopPropagation(); commit(); });
}

function initSettings() {
    bindSetting(DOM.fontSize, e => {
        const n = parseInt(e.target.value, 10);
        if (!(n >= 6 && n <= 20)) return;
        settings.FONT_SIZE = n;
        stations.forEach(renderPopup);
    });

    bindSetting(DOM.color, e => {
        settings.COLOR = e.target.value;
        forEachStation(s => {
            s.color = settings.COLOR;
            renderMarker(s);
            renderPolygon(s);
            renderPopup(s);
        });
    });

    bindSetting(DOM.markerSize, e => {
        settings.MARKER_SIZE = markerSizeByIndex(parseInt(e.target.value, 10));
        DOM.markerSizeValue.textContent = settings.MARKER_SIZE;
        forEachStation(s => {
            s.markerSize = settings.MARKER_SIZE;
            renderMarker(s);
        });
    });

    bindSetting(DOM.radius, e => {
        const n = finiteNumber(e.target.value);
        if (!(n > 0)) return;
        settings.RADIUS = clamp(n, 1, 1000000);
        forEachStation(s => {
            s.radius = settings.RADIUS;
            renderPolygon(s);
        });
    });

    bindSetting(DOM.width, e => {
        const raw = e.target.value;
        const n = raw === '' ? '' : finiteNumber(raw);
        if (n !== '' && !(n >= 0 && n <= 360)) {
            e.target.value = settings.AZIMUTH_WIDTH;
            toast('Ширина азимуту має бути в діапазоні від 0 до 360 градусів.', 'warn');
            return;
        }
        settings.AZIMUTH_WIDTH = n;
        forEachStation(s => {
            s.width = n;
            renderPolygon(s);
        });
    });

    bindSetting(DOM.popupDistance, e => {
        const n = parseInt(e.target.value, 10);
        if (!(n >= 50 && n <= 500)) return;
        settings.POPUP_DISTANCE = n;
        stations.forEach(resetPopupPosition);
    });

    DOM.geocode.addEventListener('change', e => {
        settings.GEOCODE = e.target.checked;
        scheduleSave();
    });

    DOM.bold.addEventListener('change', e => {
        settings.FONT_WEIGHT = e.target.checked ? 'bold' : 'normal';
        stations.forEach(renderPopup);
        scheduleSave();
    });

    DOM.italic.addEventListener('change', e => {
        settings.FONT_STYLE = e.target.checked ? 'italic' : 'normal';
        stations.forEach(renderPopup);
        scheduleSave();
    });
}
