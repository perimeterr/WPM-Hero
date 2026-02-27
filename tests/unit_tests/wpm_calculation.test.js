import { describe, test } from '@jest/globals';
import { getWordsPerMinute } from '../../static/wpm_calculation.js';

// NOTE: For WPM calculations, a word is defined as 5 characters.

describe('Words Per Minute Calculation', () => {
    test('calculates WPM after 5 minutes', () => {
        const correctKeysTyped = 125; 
        const testStartTime = Date.now() - 300000; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(5, 2);
    });

    test('calculates WPM after 1 minute', () => {
        const correctKeysTyped = 25; 
        const testStartTime = Date.now() - 60000; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(5, 2);
    });

    test('calculates WPM after 30 seconds', () => {
        const correctKeysTyped = 25; 
        const testStartTime = Date.now() - 30000; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(10, 2); 
    });

    test('calculates WPM after 0.2 seconds', () => {
        const correctKeysTyped = 25; 
        const testStartTime = Date.now() - 200; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(1500, 2); 
    });

    test('calculates WPM with zero time elapsed', () => {
        const correctKeysTyped = 25; 
        const testStartTime = Date.now(); 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBe(Infinity); 
    });

    test('calculates WPM with non-integer time elapsed', () => {
        const correctKeysTyped = 25; 
        const testStartTime = Date.now() - 12345; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(24.3013, 2); 
    });

    test ('calculates WPM with negative time elapsed', () => {
        const correctKeysTyped = 25; 
        const testStartTime = Date.now() + 60000;

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(-5, 2); 
    });

    test('calculates WPM with zero correct keys', () => {
        const correctKeysTyped = 0;
        const testStartTime = Date.now() - 60000; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(0, 2);
    });

    test('calculates WPM with large number of correct keys', () => {
        const correctKeysTyped = 1000; 
        const testStartTime = Date.now() - 60000; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(200, 2); 
    });

    test ('calculates WPM with negative correct keys typed', () => {
        const correctKeysTyped = -25; 
        const testStartTime = Date.now() - 60000; 

        const wpm = getWordsPerMinute(correctKeysTyped, testStartTime);
        expect(wpm).toBeCloseTo(-5, 2); 
    });
});