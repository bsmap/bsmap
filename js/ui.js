// Допоміжні функції інтерфейсу: створення елементів без innerHTML та сповіщення.

// el('div', {class: 'a', text: '...'}, child1, child2)
function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    let value;
    for (const [key, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (key === 'class') node.className = v;
        else if (key === 'text') node.textContent = v;
        else if (key === 'value') value = v; // value ставимо останнім (після min/max/step)
        else node.setAttribute(key, v === true ? '' : v);
    }
    if (value !== undefined) node.value = value;
    children.flat().forEach(c => node.append(c));
    return node;
}

// Багаторядковий текст -> вузли з <br> (безпечно, без innerHTML).
function textWithBreaks(text) {
    const frag = document.createDocumentFragment();
    String(text).split(/\r?\n/).forEach((line, i) => {
        if (i > 0) frag.append(document.createElement('br'));
        frag.append(document.createTextNode(line));
    });
    return frag;
}

function toast(message, type = 'info', ms = 3500) {
    let box = document.getElementById('toast-container');
    if (!box) {
        box = el('div', { id: 'toast-container', role: 'status', 'aria-live': 'polite' });
        document.body.append(box);
    }
    const item = el('div', { class: `toast toast-${type}`, text: message });
    box.append(item);
    setTimeout(() => item.remove(), ms);
}
