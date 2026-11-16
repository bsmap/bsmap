// Пошук адрес і зворотне геокодування через Nominatim.
// Політика Nominatim: не частіше 1 запиту на секунду — запити йдуть через спільну чергу.

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const NOMINATIM_MIN_INTERVAL = 1100; // мс
const SEARCH_DEBOUNCE = 700; // мс

let nominatimChain = Promise.resolve();
let nominatimLast = 0;

function nominatimRequest(path, params, signal) {
    const run = async () => {
        if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
        const wait = nominatimLast + NOMINATIM_MIN_INTERVAL - Date.now();
        if (wait > 0) await new Promise(r => setTimeout(r, wait));
        if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
        nominatimLast = Date.now();
        const url = `${NOMINATIM}/${path}?${new URLSearchParams({ format: 'json', ...params })}`;
        const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };
    const result = nominatimChain.then(run);
    nominatimChain = result.catch(() => { });
    return result;
}

// ---- Зворотне геокодування (координати -> адреса) ----
const geocodeCache = new Map();
let geocodePending = 0;

function setGeocodeIndicator(delta) {
    geocodePending = Math.max(0, geocodePending + delta);
    document.getElementById('geocode-indicator').style.display = geocodePending ? 'flex' : 'none';
}

async function reverseGeocode(lat, lng) {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (geocodeCache.has(key)) return geocodeCache.get(key);

    setGeocodeIndicator(1);
    try {
        const data = await nominatimRequest('reverse', { lat, lon: lng, zoom: 18, addressdetails: 1 });
        const a = data && data.address;
        const address = a ? [
            a.state,
            a.county,
            a.city || a.town || a.village || '',
            a.road,
            a.house_number
        ].filter(Boolean).join(', ') : '';
        geocodeCache.set(key, address);
        return address;
    } catch (error) {
        console.error('Помилка зворотного геокодування:', error);
        toast('Не вдалося отримати адресу (геокодування недоступне)', 'warn');
        return '';
    } finally {
        setGeocodeIndicator(-1);
    }
}

// ---- Пошук адреси ----
function initSearch(onPick) {
    const container = document.querySelector('.search-container');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    let timer = null;
    let controller = null;

    const hide = () => { results.hidden = true; };

    function showMessage(text) {
        results.replaceChildren(el('div', { class: 'search-item search-empty', text }));
        results.hidden = false;
    }

    async function search(query) {
        if (controller) controller.abort();
        controller = new AbortController();
        try {
            const data = await nominatimRequest('search', { q: query, limit: 5 }, controller.signal);
            if (!Array.isArray(data) || data.length === 0) return showMessage('Нічого не знайдено');
            results.replaceChildren(...data.map(item => {
                const btn = el('button', { type: 'button', class: 'search-item', role: 'option', text: item.display_name });
                btn.addEventListener('click', () => {
                    hide();
                    input.value = '';
                    onPick({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), name: item.display_name });
                });
                return btn;
            }));
            results.hidden = false;
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Помилка пошуку:', error);
            showMessage('Помилка пошуку');
        }
    }

    input.addEventListener('input', () => {
        clearTimeout(timer);
        const query = input.value.trim();
        if (query.length < 3) {
            if (controller) controller.abort();
            return hide();
        }
        timer = setTimeout(() => search(query), SEARCH_DEBOUNCE);
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            clearTimeout(timer);
            const query = input.value.trim();
            if (query.length >= 3) search(query);
        } else if (e.key === 'Escape') {
            hide();
        }
    });

    document.addEventListener('click', e => {
        if (!container.contains(e.target)) hide();
    });
}
