// Збереження: автозбереження в localStorage та файли (JSON/GeoJSON/KML).

function readSavedState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

let saveTimer = null;
let currentBaseLayer = null;

function writeSavedState() {
    try {
        const c = map.getCenter();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            stations: serializeStations(),
            settings,
            view: { lat: c.lat, lng: c.lng, zoom: map.getZoom() },
            baseLayer: currentBaseLayer
        }));
    } catch (e) {
        // localStorage може бути недоступним (приватний режим, квота) — працюємо без автозбереження
    }
}

function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(writeSavedState, 300);
}

function downloadFile(filename, text, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveStationsFile() {
    downloadFile('base_stations.json', JSON.stringify(serializeStations(), null, 2), 'application/json');
}

function exportGeoJSON() {
    downloadFile('base_stations.geojson', JSON.stringify(toGeoJSON(serializeStations()), null, 2), 'application/geo+json');
}

function exportKML() {
    downloadFile('base_stations.kml', toKML(serializeStations()), 'application/vnd.google-earth.kml+xml');
}

function loadStationsFile(file) {
    const reader = new FileReader();
    reader.onerror = () => toast('Не вдалося прочитати файл', 'error');
    reader.onload = e => {
        try {
            const { stations: loaded, skipped } = parseStationsFile(e.target.result, settings);
            restoreStations(loaded);
            commit();
            if (loaded.length) {
                map.fitBounds(L.latLngBounds(loaded.map(s => [s.lat, s.lng])), { maxZoom: 16, padding: [40, 40] });
            }
            toast(
                `Завантажено станцій: ${loaded.length}` + (skipped ? `, пропущено некоректних: ${skipped}` : ''),
                skipped ? 'warn' : 'info'
            );
        } catch (error) {
            toast('Помилка при завантаженні файлу: ' + error.message, 'error', 6000);
        }
    };
    reader.readAsText(file);
}
