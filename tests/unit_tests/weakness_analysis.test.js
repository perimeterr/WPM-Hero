import {
    errColor,
    textColor,
    getErrorLabel,
    buildTooltipHTML,
    renderKeyboard
} from '../../static/weakness_analysis.js';

function normalizeColor(str) {
    return str
        .replace(/\s+/g, '')           // remove all spaces
        .replace(/(\d+\.\d*[1-9])\d+/g, (_, n) => parseFloat(n).toFixed(2)); // trim float precision
}

describe('errColor', () => {
    test('returns neutral color for 0%', () => {
        expect(errColor(0)).toBe(normalizeColor('rgba(255, 255, 255, 0.07)'));
    });

    test('returns neutral color for undefined', () => {
        expect(normalizeColor(errColor(undefined))).toBe(normalizeColor('rgba(255,255,255,0.07)'));
    });

    test('returns a valid rgba string for low error rate', () => {
        const result = errColor(5);
        expect(normalizeColor(result)).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
    });

    test('returns a valid rgba string for medium error rate', () => {
        const result = errColor(25);
        expect(result).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
    });

    test('returns a valid rgba string for high error rate', () => {
        const result = errColor(40);
        expect(result).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
    });

    test('caps at 50% — pct of 50 and 100 produce same result', () => {
        expect(errColor(50)).toBe(errColor(100));
    });

    test('higher error rate produces higher red channel', () => {
        const low = errColor(5);
        const high = errColor(45);
        const redLow = parseInt(low.match(/rgba\((\d+)/)[1]);
        const redHigh = parseInt(high.match(/rgba\((\d+)/)[1]);
        expect(redHigh).toBeGreaterThan(redLow);
    });
});

describe('textColor', () => {
    test('returns dimmed color for 0%', () => {
        expect(textColor(0)).toBe('rgba(255,255,255,0.65)');
    });

    test('returns dimmed color for undefined', () => {
        expect(textColor(undefined)).toBe('rgba(255,255,255,0.65)');
    });

    test('returns dimmed color below threshold (pct < 8)', () => {
        expect(textColor(7)).toBe('rgba(255,255,255,0.65)');
    });

    test('returns full white at threshold (pct >= 8)', () => {
        expect(textColor(8)).toBe('#fff');
    });

    test('returns full white for high error rate', () => {
        expect(textColor(50)).toBe('#fff');
    });
});

describe('getErrorLabel', () => {
    test('labels 0–9% as Good', () => {
        expect(getErrorLabel(0)).toBe('Good');
        expect(getErrorLabel(9)).toBe('Good');
    });

    test('labels 10–19% as Needs practice', () => {
        expect(getErrorLabel(10)).toBe('Needs practice');
        expect(getErrorLabel(19)).toBe('Needs practice');
    });

    test('labels 20–34% as Weak key', () => {
        expect(getErrorLabel(20)).toBe('Weak key');
        expect(getErrorLabel(34)).toBe('Weak key');
    });

    test('labels 35%+ as Critical weakness', () => {
        expect(getErrorLabel(35)).toBe('Critical weakness');
        expect(getErrorLabel(100)).toBe('Critical weakness');
    });
});

describe('buildTooltipHTML', () => {
    test('includes the key label uppercased', () => {
        const result = buildTooltipHTML('b', 38);
        expect(result.key).toBe('B');
    });

    test('includes the error rate', () => {
        const result = buildTooltipHTML('b', 38);
        expect(result.errorRate).toBe('38% error rate');
    });

    test('includes the correct status label', () => {
        expect(buildTooltipHTML('b', 38).status).toBe('Critical weakness');
        expect(buildTooltipHTML('a', 5).status).toBe('Good');
        expect(buildTooltipHTML('c', 15).status).toBe('Needs practice');
        expect(buildTooltipHTML('d', 25).status).toBe('Weak key');
    });
});

describe('renderKeyboard', () => {
    let container;

    const rows = [
        [{ k: 'q', l: 'Q' }, { k: 'w', l: 'W' }, { k: 'e', l: 'E' }],
        [{ k: 'a', l: 'A' }, { k: 's', l: 'S', w: 'wide-15' }]
    ];

    const errorData = { q: 5, w: 22, e: 0, a: 38, s: 14 };

    beforeEach(() => {
        container = document.createElement('div');
        renderKeyboard(rows, errorData, container);
    });

    test('renders correct number of rows', () => {
        expect(container.querySelectorAll('.kbd-row').length).toBe(2);
    });

    test('renders correct number of keys total', () => {
        expect(container.querySelectorAll('.key').length).toBe(5);
    });

    test('assigns data-key attribute to each key', () => {
        const keys = container.querySelectorAll('.key');
        const keyNames = Array.from(keys).map(k => k.dataset.key);
        expect(keyNames).toEqual(['q', 'w', 'e', 'a', 's']);
    });

    test('applies width class when provided', () => {
        const sKey = container.querySelector('[data-key="s"]');
        expect(sKey.classList.contains('wide-15')).toBe(true);
    });

    test('renders key label text correctly', () => {
        const qKey = container.querySelector('[data-key="q"]');
        expect(qKey.querySelector('.key-label').textContent).toBe('Q');
    });

    test('applies colored background for high error key', () => {
        const aKey = container.querySelector('[data-key="a"]');
        expect(aKey.dataset.color).toBe(errColor(38));
        expect(aKey.dataset.color).not.toBe(errColor(0));
    });

    test('applies neutral background for 0% error key', () => {
        const eKey = container.querySelector('[data-key="e"]');
        expect(eKey.dataset.color).toBe(errColor(0));
    });
});