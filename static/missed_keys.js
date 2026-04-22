export function errColor(pct) {
    if (pct >= 75) return { bg: 'rgba(162,45,45,0.28)', border: '#F09595', text: '#F09595' };
    if (pct >= 40) return { bg: 'rgba(186,117,23,0.2)',  border: '#FAC775', text: '#FAC775' };
    return             { bg: 'rgba(188,152,33,0.15)',    border: '#bc9821',  text: '#bc9821' };
}

export function getLabel(pct) {
    if (pct >= 75) return 'Critical';
    if (pct >= 40) return 'Weak';
    return 'Missed';
}

export function renderMissedKeys(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        container.innerHTML = '<p class="no-errors">No key errors — perfect accuracy!</p>';
        return;
    }

    sorted.forEach(([key, pct]) => {
        const { bg, border, text } = errColor(pct);
        const chip = document.createElement('div');
        chip.className = 'missed-key-chip';
        chip.style.cssText = `
            background: ${bg};
            border: 0.5px solid ${border};
            border-radius: 10px;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            min-width: 56px;
        `;
        chip.innerHTML = `
            <span style="font-size:20px;font-weight:700;color:${text}">${key.toUpperCase()}</span>
            <span style="font-size:11px;font-weight:600;color:${text}">${pct}%</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.4)">${getLabel(pct)}</span>
        `;
        container.appendChild(chip);
    });
}