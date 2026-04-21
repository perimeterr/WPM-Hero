export function errColor(pct) {
    if (pct === undefined || pct === 0) return 'rgba(255,255,255,0.07)';
    const capped = Math.min(pct / 50, 1);
    if (capped < 0.25) {
        const t = capped / 0.25;
        return `rgba(${Math.round(188*t+255*(1-t)*0.18)},${Math.round(152*t+255*(1-t)*0.18)},${Math.round(33*t+255*(1-t)*0.18)},${0.25+t*0.35})`;
    } else if (capped < 0.6) {
        const t = (capped-0.25)/0.35;
        return `rgba(${Math.round(188+64*t)},${Math.round(152-100*t)},${Math.round(33-20*t)},${0.6+t*0.2})`;
    } else {
        const t = (capped-0.6)/0.4;
        return `rgba(${Math.round(226+t*6)},${Math.round(75-55*t)},${Math.round(13+t*5)},${0.8+t*0.2})`;
    }
}

export function textColor(pct) {
    if (!pct || pct < 8) return 'rgba(255,255,255,0.65)';
    return '#fff';
}

export function getErrorLabel(pct) {
    if (pct < 10) return 'Good';
    if (pct < 20) return 'Needs practice';
    if (pct < 35) return 'Weak key';
    return 'Critical weakness';
}

export function buildTooltipHTML(key, pct) {
    const label = key.length === 1 && key.match(/[A-Z]/i) ? key.toUpperCase() : key;
    return {
        key: label,
        errorRate: `${pct}% error rate`,
        status: getErrorLabel(pct)
    };
}

export function renderTooltip(keyEl, key, pct) {
    const tip = document.createElement('div');
    tip.className = 'tooltip';

    const isAlpha = key.length === 1 && key.match(/[a-zA-Z]/);
    const displayKey = isAlpha ? key.toUpperCase() : key;

    tip.innerHTML = `
        <div class="tt-key">${displayKey}</div>
        <div class="tt-err" style="color:${errColor(pct * 1.2)}">${pct}% error rate</div>
        <div class="tt-sub">${getErrorLabel(pct)}</div>
    `;

    keyEl.appendChild(tip);

    keyEl.addEventListener('mouseenter', () => tip.classList.add('visible'));
    keyEl.addEventListener('mouseleave', () => tip.classList.remove('visible'));

    return tip;
}

export function renderKeyboard(rows, errorData, container) {
    rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'kbd-row';
        row.forEach(({ k, l, w }) => {
            const pct = errorData[k];
            const keyEl = document.createElement('div');
            keyEl.className = 'key' + (w ? ' ' + w : '');
            keyEl.dataset.key = k;
            keyEl.dataset.color = errColor(pct);
            keyEl.style.background = errColor(pct);
            keyEl.style.color = textColor(pct);
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = l;
            keyEl.appendChild(label);

            if (pct !== undefined && pct > 0) {
                renderTooltip(keyEl, k, pct);
            }

            rowEl.appendChild(keyEl);
        });
        container.appendChild(rowEl);
    });
}

export function renderLegend(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stops = [0, 10, 20, 30, 40, 50];

    stops.forEach((s, i) => {
        if (i === stops.length - 1) return;
        const seg = document.createElement('div');
        seg.className = 'legend-seg';
        seg.style.background = errColor((stops[i] + stops[i + 1]) / 2);
        container.appendChild(seg);
    });
}
