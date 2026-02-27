import { afterEach, expect, jest, test } from '@jest/globals';
import { setTimer, getTimeLeft, setTimerStarted, isTimerStarted, startTimer, updateTestStartTime, getTestStartTime } from '../../static/timer.js';

describe('Timer Module', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        setTimer(60); // Reset timer before each test
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should initialize timer correctly', () => {
        expect(getTimeLeft()).toBe(60);
        expect(isTimerStarted()).toBe(false);
    });

    test('should start timer and count down', () => {
        startTimer(() => {}, () => {});
        jest.advanceTimersByTime(30000); // Advance time by 30 seconds
        expect(getTimeLeft()).toBe(30);
    });

    test('should call onTick callback every second', () => {
        const onTick = jest.fn();
        startTimer(onTick, () => {});
        jest.advanceTimersByTime(5000); // Advance time by 5 seconds
        expect(onTick).toHaveBeenCalledTimes(5);
        expect(onTick).toHaveBeenNthCalledWith(1, 59);
        expect(onTick).toHaveBeenNthCalledWith(2, 58);
        expect(onTick).toHaveBeenNthCalledWith(3, 57);
        expect(onTick).toHaveBeenNthCalledWith(4, 56);
        expect(onTick).toHaveBeenNthCalledWith(5, 55);
    });

    test('should call onComplete callback when time runs out', () => {
        const onComplete = jest.fn();
        startTimer(() => {}, onComplete);
        jest.advanceTimersByTime(60000); // Advance time by 60 seconds
        expect(onComplete).toHaveBeenCalled();
    });

    test('should be flagged as still running until time runs out', () => {
        const onComplete = jest.fn();
        startTimer(() => {}, onComplete);
        expect(isTimerStarted()).toBe(true); // Timer should be running
        jest.advanceTimersByTime(60000); // Advance time by 60 seconds
        expect(isTimerStarted()).toBe(false); // Timer should have stopped
    });

    test('should stop timer when time runs out', () => {
        const onComplete = jest.fn();
        startTimer(() => {}, onComplete);

        jest.advanceTimersByTime(60000); // Advance time by 60 seconds
        
        expect(getTimeLeft()).toBe(0);
        expect(onComplete).toHaveBeenCalled();
    });

    test('should reset timer correctly', () => {
        setTimer(30);
        expect(getTimeLeft()).toBe(30);
        setTimer(60);
        expect(getTimeLeft()).toBe(60);
    });

    test ('should not start timer if already started', () => {
        startTimer(() => {}, () => {});
        const remainingSecondsBefore = getTimeLeft();

        jest.advanceTimersByTime(10000); // Advance time by 10 seconds

        startTimer(() => {}, () => {}); // Attempt to start timer again
        const remainingSecondsAfter = getTimeLeft();
        
        expect(remainingSecondsAfter).toBe(remainingSecondsBefore - 10); // Timer should not be reset
        expect(isTimerStarted()).toBe(true); // Timer should still be running
    });

    test('should get test start time correctly', () => {
        startTimer(() => {}, () => {});
        const startTime = getTestStartTime();

        jest.advanceTimersByTime(30000); // Advance time by 30 seconds

        expect(getTestStartTime()).toBe(startTime);
    });
});