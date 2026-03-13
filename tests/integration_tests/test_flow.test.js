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

        // Advance time by 30 seconds
        jest.advanceTimersByTime(30000);

        expect(getTimeLeft()).toBe(30);
        expect(isTimerStarted()).toBe(true);

        const typingInput = { value: 'Hxlxo' };

        // Validate characters
        validateCharacter(displayElementChars, typingInput);

        // Check character validation results
        expect(displayElementChars[0].style.color).toBe('green');
        expect(displayElementChars[1].style.color).toBe('red');
        expect(displayElementChars[2].style.color).toBe('green');
        expect(displayElementChars[3].style.color).toBe('red');
        expect(displayElementChars[4].style.color).toBe('green');

        // Check accuracy tracking
        expect(getKeyAccuracy('H')).toBe(100);
        expect(getKeyAccuracy('e')).toBe(0);
        expect(getKeyAccuracy('l')).toBe(50);
        expect(getKeyAccuracy('o')).toBe(100);
        expect(getRealTimeAccuracy()).toBe(60);
        

        const wpm = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
        expect(wpm).toBeCloseTo(1.2, 1);

        // Reset accuracy and check results
        resetAccuracy();
        expect(getRealTimeAccuracy()).toBe(100);
    });
});

function buildHomeReplayDom(displayTextLength) {
    const textSpans = Array.from({ length: displayTextLength })
        .map(() => '<span class="char">x</span>')
        .join('');

    document.body.innerHTML = `
        <select id="difficulty">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
        </select>
        <select id="timer">
            <option value="60">60</option>
            <option value="30">30</option>
            <option value="15">15</option>
        </select>
        <div id="text-content">${textSpans}</div>
        <textarea id="typing-input"></textarea>
        <span id="wpm">0</span>
        <span id="accuracy">0%</span>
        <span id="time">0s</span>
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
        const savedText = 'hello world';
        buildHomeReplayDom(savedText.length);

        localStorage.setItem('clickedReplay', 'true');
        localStorage.setItem('testSettings', JSON.stringify({
            difficulty: 'hard',
            timer: '30',
            displayText: savedText,
        }));

        await jest.isolateModulesAsync(async () => {
            await import('../../static/script.js');
        });

        document.dispatchEvent(new Event('DOMContentLoaded'));

        expect(document.getElementById('difficulty').value).toBe('hard');
        expect(document.getElementById('timer').value).toBe('30');
        expect(document.getElementById('time').textContent).toBe('30');

        const renderedText = Array.from(document.querySelectorAll('.char'))
            .map((char) => char.textContent)
            .join('');
        expect(renderedText).toBe(savedText);
    });
});

