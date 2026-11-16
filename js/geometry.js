// Чиста геометрія (без DOM і Leaflet) — покрита тестами.
// Азимут відраховується від півночі за годинниковою стрілкою.

const METERS_PER_DEGREE = 111320;
const DEG = Math.PI / 180;

// Точка на відстані `distance` метрів від (lat, lng) в напрямку `bearing` градусів.
function offsetLatLng(lat, lng, distance, bearing) {
    const rad = bearing * DEG;
    return {
        lat: lat + (distance / METERS_PER_DEGREE) * Math.cos(rad),
        lng: lng + (distance / (METERS_PER_DEGREE * Math.cos(lat * DEG))) * Math.sin(rad)
    };
}

// Азимут (0..360) з точки (lat, lng) на точку (lat2, lng2).
function bearingDegrees(lat, lng, lat2, lng2) {
    const dy = (lat2 - lat) * METERS_PER_DEGREE;
    const dx = (lng2 - lng) * METERS_PER_DEGREE * Math.cos(lat * DEG);
    const deg = Math.atan2(dx, dy) / DEG;
    return (deg + 360) % 360;
}

// Положення інфобокса: за замовчуванням з протилежного від сектора боку.
function calculatePopupPosition(lat, lng, azimuth, distance) {
    const az = azimuth === '' || azimuth == null ? 0 : azimuth;
    return offsetLatLng(lat, lng, distance, (az + 180) % 360);
}

// Вершини сектора: центр, дуга кроком 1° (з гарантованим кінцем), центр.
function sectorPoints(lat, lng, azimuth, radius, width) {
    const start = azimuth - width / 2;
    const end = azimuth + width / 2;
    const points = [[lat, lng]];
    let angle = start;
    while (angle <= end) {
        const p = offsetLatLng(lat, lng, radius, angle);
        points.push([p.lat, p.lng]);
        angle += 1;
    }
    if (angle - 1 < end) {
        const p = offsetLatLng(lat, lng, radius, end);
        points.push([p.lat, p.lng]);
    }
    points.push([lat, lng]);
    return points;
}

// Коло з n вершин (для ширини 360° в експорті).
function circlePoints(lat, lng, radius, n = 72) {
    const points = [];
    for (let i = 0; i <= n; i++) {
        const p = offsetLatLng(lat, lng, radius, (360 * i) / n);
        points.push([p.lat, p.lng]);
    }
    return points;
}
