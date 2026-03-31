import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getCSRFToken } from '../../static/results.js';

function buildResultsDom() {
	document.body.innerHTML = `
		<span id="wpm">0.00</span>
		<span id="accuracy">0.00%</span>
		<ul id="mistake-list"></ul>
		<a href="/">Back to Home</a>
		<button id="replay-btn">Replay</button>
		<button id="new-test-btn">New Test</button>
	`;
}

global.testDifficulty = 'difficulty';
global.testTimer = 15;

describe('Results Module Base Tests', () => {
	beforeEach(() => {
		global.isLoggedIn = false;
		buildResultsDom();
		document.dispatchEvent(new Event('DOMContentLoaded'));
	});

	afterEach(() => {
		localStorage.clear();
	});

	test('properly handle missing or invalid localStorage values', () => {
		document.dispatchEvent(new Event('DOMContentLoaded'));

		expect(document.getElementById('wpm').textContent).toBe('0.00');
		expect(document.getElementById('accuracy').textContent).toBe('0.00%');
		expect(document.getElementById('mistake-list').innerHTML).toBe('');
	});

	describe('Replay button', () => {
		test('sets clickedReplay in localStorage to true when clicked', () => {
			document.getElementById('replay-btn').click();

			expect(localStorage.getItem('clickedReplay')).toBe('true');
		});

		test('does not remove testSettings when clicked', () => {
			localStorage.setItem('testSettings', JSON.stringify({ difficulty: 'easy' }));

			document.getElementById('replay-btn').click();

			expect(localStorage.getItem('testSettings')).not.toBeNull();
		});
	});

	describe('New Test button', () => {
		test('removes clickedReplay from localStorage when clicked', () => {
			localStorage.setItem('clickedReplay', 'true');

			document.getElementById('new-test-btn').click();

			expect(localStorage.getItem('clickedReplay')).toBeNull();
		});

		test('removes testSettings from localStorage when clicked', () => {
			localStorage.setItem('testSettings', JSON.stringify({ difficulty: 'hard' }));

			document.getElementById('new-test-btn').click();

			expect(localStorage.getItem('testSettings')).toBeNull();
		});

		test('does not set clickedReplay when clicked', () => {
			document.getElementById('new-test-btn').click();

			expect(localStorage.getItem('clickedReplay')).toBeNull();
		});
	});
});

describe('Results Module Save Results Tests', () => {
	let mockFetch;

	beforeEach(() => {
		global.isLoggedIn = true;
		mockFetch = jest.fn().mockResolvedValue({
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;
		buildResultsDom();
	});

	afterEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});
	
	test('sends POST request to save results with correct payload', async () => {
		localStorage.setItem('finalWPM', '72.5');
		localStorage.setItem('finalAccuracy', '95.0');
		localStorage.setItem('finalMistypedKeys', JSON.stringify({ a: 2, s: 1 }));

		document.dispatchEvent(new Event('DOMContentLoaded'));

		expect(mockFetch).toHaveBeenCalledWith('/save-result/', expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				'X-CSRFToken': getCSRFToken(),
			}),
			body: JSON.stringify({
				difficulty: testDifficulty,
				timer: testTimer,
				wpm: 72.5,
				accuracy: 95.0,
				mistyped_keys: { a: 2, s: 1 }
			}),
		}));
	});
});