// Точка входу: збирає модулі разом.

function initMapEvents() {
    map.on('click', async e => {
        if (isRecentlyDragged) return;
        const target = e.originalEvent && e.originalEvent.target;
        if (target && target.closest && target.closest('.leaflet-control, .info-box, #button-container')) return;

        // Не створювати станцію поряд з наявною (відстань у пікселях, а не метрах)
        const nearExisting = stations.some(s =>
            map.latLngToContainerPoint([s.lat, s.lng]).distanceTo(e.containerPoint) < 14);
        if (nearExisting) return;

        const { lat, lng } = e.latlng;
        const address = settings.GEOCODE ? await reverseGeocode(lat, lng) : '';
        const s = addStation(newStationData(lat, lng, address));
        updateStationList();
        selectStation(s.id, { scroll: true });
        commit();
    });
}

function initButtons() {
    const toggle = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', e => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        const collapsed = sidebar.classList.contains('collapsed');
        toggle.textContent = collapsed ? 'Розгорнути панель' : 'Згорнути панель';
        toggle.setAttribute('aria-expanded', String(!collapsed));
        document.getElementById('geocode-indicator').style.left = collapsed ? '50%' : 'calc(50% + 150px)';
        setTimeout(() => map.invalidateSize(), 300);
    });

    document.getElementById('delete-all').addEventListener('click', e => {
        e.stopPropagation();
        if (!stations.length) return;
        if (!confirm(`Видалити всі станції (${stations.length})? Дію можна скасувати кнопкою «Скасувати».`)) return;
        clearStations();
        updateStationList();
        commit();
    });

    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('save-json').addEventListener('click', saveStationsFile);
    document.getElementById('export-geojson').addEventListener('click', exportGeoJSON);
    document.getElementById('export-kml').addEventListener('click', exportKML);

    const fileInput = document.getElementById('file-input');
    document.getElementById('load-json').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) loadStationsFile(fileInput.files[0]);
        fileInput.value = ''; // дозволяє вибрати той самий файл повторно
    });

    document.addEventListener('keydown', e => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return; // власний undo поля
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if (key === 'y' || (key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    });
}

function init() {
    applySavedSettings(savedState && savedState.settings);
    syncSettingsToDom();
    initSettings();
    initStationList();
    initButtons();
    initMapEvents();
    initSearch(({ lat, lng, name }) => {
        map.setView([lat, lng], 16);
        const s = addStation(newStationData(lat, lng, settings.GEOCODE ? name : ''));
        updateStationList();
        selectStation(s.id, { scroll: true });
        commit();
    });

    // Відновлення станцій з автозбереження
    if (savedState && Array.isArray(savedState.stations)) {
        const restored = savedState.stations.map(s => sanitizeStation(s, settings)).filter(Boolean);
        restoreStations(restored);
    }
    commit(); // початковий крок історії
}

init();
