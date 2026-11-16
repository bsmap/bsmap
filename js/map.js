// Ініціалізація карти, шарів і відновлення останнього вигляду.
const savedState = readSavedState();

const savedView = savedState && savedState.view;
const startView = savedView && Math.abs(savedView.lat) <= 90 && Math.abs(savedView.lng) <= 180 && savedView.zoom >= 1 && savedView.zoom <= 19
    ? savedView
    : { lat: 50.4501, lng: 30.5234, zoom: 14 }; // Київ

const map = L.map('map').setView([startView.lat, startView.lng], startView.zoom);

const baseLayers = {
    'Карта': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; учасники <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    'Супутник': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
    })
};

currentBaseLayer = savedState && baseLayers[savedState.baseLayer] ? savedState.baseLayer : 'Карта';
baseLayers[currentBaseLayer].addTo(map);
L.control.layers(baseLayers, null, { position: 'bottomright' }).addTo(map);

map.on('baselayerchange', e => {
    currentBaseLayer = e.name;
    scheduleSave();
});
map.on('moveend', scheduleSave);
