import { describe, test, expect, beforeEach } from '@jest/globals';
import { errColor, getLabel, renderMissedKeys } from '../../static/missed_keys.js';

describe('errColor', () => {
    test('returns red theme for pct >= 75', () => {
        const result = errColor(75);
        expect(result.bg).toBe('rgba(162,45,45,0.28)');
        expect(result.border).toBe('#F09595');
        expect(result.text).toBe('#F09595');
    });

    test('returns red theme for pct above 75', () => {
        const result = errColor(100);
        expect(result.border).toBe('#F09595');
    });

    test('returns orange theme for pct >= 40 and < 75', () => {
        const result = errColor(40);
        expect(result.bg).toBe('rgba(186,117,23,0.2)');
        expect(result.border).toBe('#FAC775');
        expect(result.text).toBe('#FAC775');
    });

    test('returns orange theme for pct in mid range', () => {
        const result = errColor(60);
        expect(result.border).toBe('#FAC775');
    });

    test('returns gold theme for pct < 40', () => {
        const result = errColor(39);
        expect(result.bg).toBe('rgba(188,152,33,0.15)');
        expect(result.border).toBe('#bc9821');
        expect(result.text).toBe('#bc9821');
    });

    test('returns gold theme for pct of 0', () => {
        const result = errColor(0);
        expect(result.border).toBe('#bc9821');
    });

    test('returns an object with bg, border and text keys', () => {
        const result = errColor(50);
        expect(result).toHaveProperty('bg');
        expect(result).toHaveProperty('border');
        expect(result).toHaveProperty('text');
    });

    test('boundary — 74 returns orange not red', () => {
        expect(errColor(74).border).toBe('#FAC775');
    });

    test('boundary — 75 returns red not orange', () => {
        expect(errColor(75).border).toBe('#F09595');
    });

    test('boundary — 39 returns gold not orange', () => {
        expect(errColor(39).border).toBe('#bc9821');
    });

    test('boundary — 40 returns orange not gold', () => {
        expect(errColor(40).border).toBe('#FAC775');
    });
});

describe('getLabel', () => {
    test('returns Critical for pct >= 75', () => {
        expect(getLabel(75)).toBe('Critical');
        expect(getLabel(100)).toBe('Critical');
    });

    test('returns Weak for pct >= 40 and < 75', () => {
        expect(getLabel(40)).toBe('Weak');
        expect(getLabel(74)).toBe('Weak');
    });

    test('returns Missed for pct < 40', () => {
        expect(getLabel(0)).toBe('Missed');
        expect(getLabel(39)).toBe('Missed');
    });

    test('boundary — 74 is Weak not Critical', () => {
        expect(getLabel(74)).toBe('Weak');
    });

    test('boundary — 75 is Critical not Weak', () => {
        expect(getLabel(75)).toBe('Critical');
    });

    test('boundary — 39 is Missed not Weak', () => {
        expect(getLabel(39)).toBe('Missed');
    });

    test('boundary — 40 is Weak not Missed', () => {
        expect(getLabel(40)).toBe('Weak');
    });
});

describe('renderMissedKeys', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = '<div id="missed-keys-container"></div>';
        container = document.getElementById('missed-keys-container');
    });

    test('renders nothing and returns early if container does not exist', () => {
        renderMissedKeys({ a: 50 }, 'nonexistent-id');
        expect(container.innerHTML).toBe('');
    });

    test('renders no-errors message when data is empty', () => {
        renderMissedKeys({}, 'missed-keys-container');
        expect(container.innerHTML).toContain('No key errors');
        expect(container.querySelector('.no-errors')).not.toBeNull();
    });

    test('renders one chip per key', () => {
        renderMissedKeys({ a: 20, b: 50, c: 80 }, 'missed-keys-container');
        expect(container.querySelectorAll('.missed-key-chip').length).toBe(3);
    });

    test('renders chips sorted by error rate descending', () => {
        renderMissedKeys({ a: 20, b: 80, c: 50 }, 'missed-keys-container');
        const chips = container.querySelectorAll('.missed-key-chip');
        const labels = Array.from(chips).map(chip =>
            chip.querySelector('span:first-child').textContent
        );
        expect(labels).toEqual(['B', 'C', 'A']);
    });

    test('renders key label uppercased', () => {
        renderMissedKeys({ f: 60 }, 'missed-keys-container');
        const chip = container.querySelector('.missed-key-chip');
        expect(chip.querySelector('span:first-child').textContent).toBe('F');
    });

    test('renders correct percentage', () => {
        renderMissedKeys({ j: 45 }, 'missed-keys-container');
        const chip = container.querySelector('.missed-key-chip');
        expect(chip.innerHTML).toContain('45%');
    });

    test('renders correct label for critical key', () => {
        renderMissedKeys({ b: 80 }, 'missed-keys-container');
        const chip = container.querySelector('.missed-key-chip');
        expect(chip.innerHTML).toContain('Critical');
    });

    test('renders correct label for weak key', () => {
        renderMissedKeys({ b: 55 }, 'missed-keys-container');
        const chip = container.querySelector('.missed-key-chip');
        expect(chip.innerHTML).toContain('Weak');
    });

    test('renders correct label for missed key', () => {
        renderMissedKeys({ b: 25 }, 'missed-keys-container');
        const chip = container.querySelector('.missed-key-chip');
        expect(chip.innerHTML).toContain('Missed');
    });

    test('handles single key correctly', () => {
        renderMissedKeys({ z: 100 }, 'missed-keys-container');
        expect(container.querySelectorAll('.missed-key-chip').length).toBe(1);
        expect(container.innerHTML).toContain('Z');
    });

    test('does not render no-errors message when data has keys', () => {
        renderMissedKeys({ a: 30 }, 'missed-keys-container');
        expect(container.querySelector('.no-errors')).toBeNull();
    });

    test('clears previous content on re-render', () => {
        renderMissedKeys({ a: 30 }, 'missed-keys-container');
        expect(container.querySelectorAll('.missed-key-chip').length).toBe(1);
        container.innerHTML = '';
        renderMissedKeys({ a: 30, b: 50 }, 'missed-keys-container');
        expect(container.querySelectorAll('.missed-key-chip').length).toBe(2);
    });
});