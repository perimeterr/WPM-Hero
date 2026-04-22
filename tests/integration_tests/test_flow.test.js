import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getCorrectIndicesSize,  
    getRealTimeAccuracy, getKeyAccuracy, resetAccuracy} from '../../static/accuracy_calculation.js';
import { validateCharacter } from '../../static/character_validator.js';
import { startTimer, setTimer, getTestStartTime, 
    getTimeLeft, isTimerStarted } from '../../static/timer.js';
import { getWordsPerMinute } from '../../static/wpm_calculation.js';

describe('Flow Test', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        setTimer(60);
        resetAccuracy();
    });

    afterEach(() => {
        jest.useRealTimers();
    });
    
    test('should track correct and mistyped keys, calculate accuracy and WPM, and manage timer correctly', () => {
        const displayElementChars = [
            { textContent: 'H', style: { color: '' } },
            { textContent: 'e', style: { color: '' } },
            { textContent: 'l', style: { color: '' } },
            { textContent: 'l', style: { color: '' } },
            { textContent: 'o', style: { color: '' } }
        ];

        expect(getTimeLeft()).toBe(60);
        expect(isTimerStarted()).toBe(false);

        startTimer(() => {}, () => {});

        jest.advanceTimersByTime(30000);

        expect(getTimeLeft()).toBe(30);
        expect(isTimerStarted()).toBe(true);

        const typingInput = { value: 'Hxlxo' };
        validateCharacter(displayElementChars, typingInput);

        expect(displayElementChars[0].style.color).toBe('white');
        expect(displayElementChars[1].style.color).toBe('red');
        expect(displayElementChars[2].style.color).toBe('white');
        expect(displayElementChars[3].style.color).toBe('red');
        expect(displayElementChars[4].style.color).toBe('white');

        expect(getKeyAccuracy('H')).toBe(100);
        expect(getKeyAccuracy('e')).toBe(0);
        expect(getKeyAccuracy('l')).toBe(50);
        expect(getKeyAccuracy('o')).toBe(100);
        expect(getRealTimeAccuracy()).toBe(60);

        const wpm = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
        expect(wpm).toBeCloseTo(1.2, 1);

        resetAccuracy();
        expect(getRealTimeAccuracy()).toBe(100);
    });
});

function buildHomeReplayDom() {
    document.body.innerHTML = `
        <div id="typing-wrapper"></div>

        <select id="difficulty-select">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
        </select>

        <select id="timer-select">
            <option value="60">60</option>
            <option value="30">30</option>
            <option value="15">15</option>
        </select>

        <select id="custom-text-select">
            <option value="">None</option>
        </select>

        <div id="text-content"></div>
        <input type="text" id="typing-input" />

        <span id="wpm">0.00</span>
        <span id="accuracy">100.00</span>
        <span id="time">60</span>

        <script id="all-texts-data" type="application/json">
            {"easy": [{"id": 1, "content": "easy sample text for testing purposes here"}],
             "medium": [{"id": 2, "content": "medium sample text for testing purposes here"}],
             "hard": [{"id": 3, "content": "hard sample text for testing purposes here"}]}
        </script>
        <script id="custom-texts-data" type="application/json">[]</script>
    `;
}

describe('Replay restore integration', () => {
    beforeEach(() => {
        jest.resetModules();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
    });

    test('restores saved difficulty, timer, and test text after replay', async () => {
        const savedText = 'The most generic example text ever.'.replace(/ /g, '\u00A0');
        buildHomeReplayDom();

        localStorage.setItem('clickedReplay', 'true');
        localStorage.setItem('testSettings', JSON.stringify({
            difficulty: 'hard',
            timer: '15',
            text: savedText,  // updated from displayText to text
        }));

        await jest.isolateModulesAsync(async () => {
            await import('../../static/script.js');
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));

        expect(document.getElementById('difficulty-select').value).toBe('hard');
        expect(document.getElementById('timer-select').value).toBe('15');
        expect(document.getElementById('time').textContent).toBe('15');

        const renderedText = Array.from(document.querySelectorAll('.char'))
            .map(char => char.textContent)
            .join('');
        expect(renderedText).toBe(savedText);
    });

    test('clears clickedReplay from localStorage after replay init', async () => {
        buildHomeReplayDom();

        localStorage.setItem('clickedReplay', 'true');
        localStorage.setItem('testSettings', JSON.stringify({
            difficulty: 'medium',
            timer: '30',
            text: 'some text here',
        }));

        await jest.isolateModulesAsync(async () => {
            await import('../../static/script.js');
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));

        expect(localStorage.getItem('clickedReplay')).toBeNull();
    });

    test('loads random text when no replay flag is set', async () => {
        buildHomeReplayDom();

        await jest.isolateModulesAsync(async () => {
            await import('../../static/script.js');
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));

        const renderedText = Array.from(document.querySelectorAll('.char'))
            .map(char => char.textContent)
            .join('');

        expect(renderedText.length).toBeGreaterThan(0);
    });
});