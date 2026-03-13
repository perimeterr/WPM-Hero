import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

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

async function loadResultsScript() {
	await jest.isolateModulesAsync(async () => {
		await import('../../static/results.js');
	});

	document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('results.js', () => {
	beforeEach(() => {
		jest.resetModules();
		localStorage.clear();
		buildResultsDom();
	});

	afterEach(() => {
		localStorage.clear();
		document.body.innerHTML = '';
	});

	test('renders WPM, accuracy, and mistakes from localStorage', async () => {
		localStorage.setItem('finalWPM', '76.67');
		localStorage.setItem('finalAccuracy', '90.00');
		localStorage.setItem('finalMistypedKeys', JSON.stringify({ a: 2, z: 1 }));

		await loadResultsScript();

		expect(document.getElementById('wpm').textContent).toBe('76.67');
		expect(document.getElementById('accuracy').textContent).toBe('90.00%');

		const items = document.querySelectorAll('#mistake-list li');
		expect(items).toHaveLength(2);
		expect(items[0].textContent).toContain('A');
		expect(items[0].textContent).toContain('2');
		expect(items[1].textContent).toContain('Z');
		expect(items[1].textContent).toContain('1');
	});

	test('replay click sets clickedReplay flag', async () => {
		await loadResultsScript();

		const replayButton = document.getElementById('replay-btn');
		replayButton.click();
		

		expect(localStorage.getItem('clickedReplay')).toBe('true');
	});

	test('new test click clears replay-related settings', async () => {
		localStorage.setItem('clickedReplay', 'true');
		localStorage.setItem('testSettings', JSON.stringify({ difficulty: 'hard', timer: '30' }));

		await loadResultsScript();

		const newTestButton = document.getElementById('new-test-btn');
		newTestButton.click();

		expect(localStorage.getItem('clickedReplay')).toBeNull();
		expect(localStorage.getItem('testSettings')).toBeNull();
	});

	test('back link clears replay flag', async () => {
		localStorage.setItem('clickedReplay', 'true');

		await loadResultsScript();

		document.querySelector('a[href="/"]').click();

		expect(localStorage.getItem('clickedReplay')).toBeNull();
	});
});
