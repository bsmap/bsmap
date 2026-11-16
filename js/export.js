// Експорт у GeoJSON і KML (чисті функції; залежать від geometry.js).

function stationLabel(s, index) {
    return s.name || s.address || `Станція ${index + 1}`;
}

// Кільце полігона сектора у вигляді [lat, lng] або null, якщо сектора немає.
function stationSectorRing(s) {
    if (s.width === '' || !(s.radius > 0)) return null;
    if (s.width >= 360) return circlePoints(s.lat, s.lng, s.radius);
    return sectorPoints(s.lat, s.lng, s.azimuth === '' ? 0 : s.azimuth, s.radius, s.width);
}

function toGeoJSON(list) {
    const features = [];
    list.forEach((s, i) => {
        const props = {
            name: stationLabel(s, i),
            address: s.address,
            azimuth: s.azimuth,
            radius: s.radius,
            width: s.width,
            color: s.color
        };
        features.push({
            type: 'Feature',
            properties: Object.assign({ kind: 'station' }, props),
            geometry: { type: 'Point', coordinates: [s.lng, s.lat] }
        });
        const ring = stationSectorRing(s);
        if (ring) {
            features.push({
                type: 'Feature',
                properties: Object.assign({ kind: 'sector' }, props),
                geometry: { type: 'Polygon', coordinates: [ring.map(([la, ln]) => [ln, la])] }
            });
        }
    });
    return { type: 'FeatureCollection', features };
}

function escapeXml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// '#rrggbb' -> 'aabbggrr' (формат кольору KML).
function kmlColor(hex, alpha = 'ff') {
    const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : '000000';
    return alpha + h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2);
}

function toKML(list) {
    const parts = [];
    list.forEach((s, i) => {
        const name = escapeXml(stationLabel(s, i));
        const desc = escapeXml(s.address || '');
        parts.push(
            `    <Style id="s${i}"><IconStyle><color>${kmlColor(s.color)}</color></IconStyle>` +
            `<LineStyle><color>${kmlColor(s.color)}</color><width>1</width></LineStyle>` +
            `<PolyStyle><color>${kmlColor(s.color, '4d')}</color></PolyStyle></Style>`
        );
        parts.push(
            `    <Placemark><name>${name}</name><description>${desc}</description><styleUrl>#s${i}</styleUrl>` +
            `<Point><coordinates>${s.lng},${s.lat},0</coordinates></Point></Placemark>`
        );
        const ring = stationSectorRing(s);
        if (ring) {
            const coords = ring.map(([la, ln]) => `${ln},${la},0`).join(' ');
            parts.push(
                `    <Placemark><name>${name} (сектор)</name><styleUrl>#s${i}</styleUrl>` +
                `<Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`
            );
        }
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>Базові станції</name>\n${parts.join('\n')}\n  </Document>\n</kml>\n`;
}
