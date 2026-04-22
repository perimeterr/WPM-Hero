import { jest, describe, test, expect, beforeEach, afterEach, afterAll } from '@jest/globals';

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('../../static/missed_keys.js', () => ({
    renderMissedKeys: jest.fn()
}));

function buildResultsDom() {
    document.body.innerHTML = `
        <span id="wpm">0.00</span>
        <span id="accuracy">0.00</span>
        <div id="missed-keys-container"></div>
        <a href="/">Back to Home</a>
        <button id="replay-btn">Replay</button>
        <button id="new-test-btn">New Test</button>
    `;
}

async function loadResults() {
    // Reset module registry so DOMContentLoaded listener re-registers
    jest.resetModules();
    buildResultsDom();
    await import('../../static/results.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

global.testDifficulty = 'easy';
global.testTimer = 15;

describe('Results Module Base Tests', () => {
    beforeEach(() => {
        global.isLoggedIn = false;
        localStorage.clear();
    });

    afterAll(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    test('displays 0.00 when localStorage values are missing', async () => {
        await loadResults();
        expect(document.getElementById('wpm').textContent).toBe('0.00');
        expect(document.getElementById('accuracy').textContent).toBe('0.00');
    });

    test('displays finalWPM from localStorage', async () => {
        localStorage.setItem('finalWPM', '85.5');
        await loadResults();
        expect(document.getElementById('wpm').textContent).toBe('85.50');
    });

    test('displays finalAccuracy from localStorage', async () => {
        localStorage.setItem('finalAccuracy', '92.3');
        await loadResults();
        expect(document.getElementById('accuracy').textContent).toBe('92.30');
    });

    describe('Replay button', () => {
        test('sets clickedReplay in localStorage to true when clicked', async () => {
            await loadResults();
            document.getElementById('replay-btn').click();
            expect(localStorage.getItem('clickedReplay')).toBe('true');
        });

        test('does not remove testSettings when clicked', async () => {
            localStorage.setItem('testSettings', JSON.stringify({ difficulty: 'easy' }));
            await loadResults();
            document.getElementById('replay-btn').click();
            expect(localStorage.getItem('testSettings')).not.toBeNull();
        });
    });

    describe('New Test button', () => {
        test('removes clickedReplay from localStorage when clicked', async () => {
            localStorage.setItem('clickedReplay', 'true');
            await loadResults();
            document.getElementById('new-test-btn').click();
            expect(localStorage.getItem('clickedReplay')).toBeNull();
        });

        test('removes testSettings from localStorage when clicked', async () => {
            localStorage.setItem('testSettings', JSON.stringify({ difficulty: 'hard' }));
            await loadResults();
            document.getElementById('new-test-btn').click();
            expect(localStorage.getItem('testSettings')).toBeNull();
        });

        test('does not set clickedReplay when clicked', async () => {
            await loadResults();
            document.getElementById('new-test-btn').click();
            expect(localStorage.getItem('clickedReplay')).toBeNull();
        });
    });
});

describe('Results Module Save Results Tests', () => {
    beforeEach(() => {
        global.isLoggedIn = true;
        global.testDifficulty = 'easy';
        global.testTimer = 15;

        Object.defineProperty(document, 'cookie', {
            value: 'csrftoken=test-token',
            writable: true,
            configurable: true,
        });

        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: true }),
        });

        localStorage.setItem('finalWPM', '72.5');
        localStorage.setItem('finalAccuracy', '95.0');
        localStorage.setItem('finalMistypedKeys', JSON.stringify({ a: 2, s: 1 }));
        localStorage.setItem('finalCorrectKeys', JSON.stringify({ a: 3, s: 4 }));
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('sends POST request when user is logged in', async () => {
        await loadResults();
        expect(global.fetch).toHaveBeenCalledWith(
            '/save-result/',
            expect.objectContaining({ method: 'POST' })
        );
    });

    test('sends correct headers including CSRF token', async () => {
        await loadResults();
        expect(global.fetch).toHaveBeenCalledWith(
            '/save-result/',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'test-token',
                }),
            })
        );
    });

    test('sends correct payload including correct_keys', async () => {
        await loadResults();
        expect(global.fetch).toHaveBeenCalledWith(
            '/save-result/',
            expect.objectContaining({
                body: JSON.stringify({
                    difficulty: 'easy',
                    timer: 15,
                    wpm: 72.5,
                    accuracy: 95.0,
                    mistyped_keys: { a: 2, s: 1 },
                    correct_keys: { a: 3, s: 4 },
                }),
            })
        );
    });

    test('does not send POST request when user is not logged in', async () => {
        global.isLoggedIn = false;
        await loadResults();
        expect(global.fetch).not.toHaveBeenCalled();
    });
});

describe('getCSRFToken', () => {
    test('returns token from cookie', async () => {
        Object.defineProperty(document, 'cookie', {
            value: 'csrftoken=abc123',
            writable: true,
            configurable: true,
        });
        jest.resetModules();
        const { getCSRFToken } = await import('../../static/results.js');
        expect(getCSRFToken()).toBe('abc123');
    });

    test('returns empty string when csrftoken cookie is missing', async () => {
        Object.defineProperty(document, 'cookie', {
            value: '',
            writable: true,
            configurable: true,
        });
        jest.resetModules();
        const { getCSRFToken } = await import('../../static/results.js');
        expect(getCSRFToken()).toBe('');
    });

    test('handles multiple cookies and finds csrftoken', async () => {
        Object.defineProperty(document, 'cookie', {
            value: 'sessionid=xyz; csrftoken=mytoken; othercookie=val',
            writable: true,
            configurable: true,
        });
        jest.resetModules();
        const { getCSRFToken } = await import('../../static/results.js');
        expect(getCSRFToken()).toBe('mytoken');
    });
});

describe('keyErrors calculation', () => {
    test('calculates error percentage correctly', () => {
        const finalMistypedKeys = { f: 3, j: 1 };
        const finalCorrectKeys  = { f: 1, j: 3 };
        const keyErrors = {};
        for (const key of Object.keys(finalMistypedKeys)) {
            const wrong   = finalMistypedKeys[key] || 0;
            const correct = finalCorrectKeys[key]  || 0;
            const total   = wrong + correct;
            if (total > 0 && wrong > 0) {
                keyErrors[key] = Math.round((wrong / total) * 100);
            }
        }
        expect(keyErrors['f']).toBe(75);
        expect(keyErrors['j']).toBe(25);
    });

    test('excludes keys with 0 wrong presses', () => {
        const finalMistypedKeys = { f: 0 };
        const finalCorrectKeys  = { f: 5 };
        const keyErrors = {};
        for (const key of Object.keys(finalMistypedKeys)) {
            const wrong   = finalMistypedKeys[key] || 0;
            const correct = finalCorrectKeys[key]  || 0;
            const total   = wrong + correct;
            if (total > 0 && wrong > 0) {
                keyErrors[key] = Math.round((wrong / total) * 100);
            }
        }
        expect(keyErrors['f']).toBeUndefined();
    });

    test('handles missing correct key entry', () => {
        const finalMistypedKeys = { b: 4 };
        const finalCorrectKeys  = {};
        const keyErrors = {};
        for (const key of Object.keys(finalMistypedKeys)) {
            const wrong   = finalMistypedKeys[key] || 0;
            const correct = finalCorrectKeys[key]  || 0;
            const total   = wrong + correct;
            if (total > 0 && wrong > 0) {
                keyErrors[key] = Math.round((wrong / total) * 100);
            }
        }
        expect(keyErrors['b']).toBe(100);
    });
});