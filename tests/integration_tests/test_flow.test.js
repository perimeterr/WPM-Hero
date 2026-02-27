import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { trackCorrectKey, trackMistypedKey, 
    removeMistakeIndex, getCorrectIndicesSize,  
    getRealTimeAccuracy, getKeyAccuracy, resetAccuracy} from '../../static/accuracy_calculation.js';
import { validateCharacter, resetDisplayTextColor } from '../../static/character_validator.js';
import { startTimer, setTimer, 
    setTimerStarted, getTestStartTime, 
    getTimeLeft,updateTestStartTime, isTimerStarted } from '../../static/timer.js';
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

        // Simulate some time passing
        jest.advanceTimersByTime(30000); // Advance time by 30 seconds

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

