import { getWordsPerMinute, resetWordsPerMinute } from './wpm_calculation.js';
import { getCorrectIndicesSize, getRealTimeAccuracy, resetAccuracy } from './accuracy_calculation.js';
import { getTestStartTime, getTimeLeft, setTimer, setTimerStarted, isTimerStarted, startTimer, updateTestStartTime } from './timer.js';
import { validateCharacter, resetDisplayTextColor } from './character_validator.js';

document.addEventListener('DOMContentLoaded', () => {
    const textDisplayChars = document.querySelectorAll('.char');
    const typingInput = document.getElementById('typing-input');
    const wordsPerMinuteDisplay = document.getElementById("wpm");
    const accuracyDisplay = document.getElementById("accuracy");
    const timeDisplay = document.getElementById("time");
    const resetBtn = document.getElementById("reset-btn");
    const timer = document.getElementById("timer");
    
    setTimer(timer.value);
    timeDisplay.textContent = getTimeLeft();
    accuracyDisplay.textContent = "100.00%";
    wordsPerMinuteDisplay.textContent = "0.00";
    
    function updateTimeDisplay(time) {
        timeDisplay.textContent = time;
    }

    function updateWPMDisplay(wpm) {
        wordsPerMinuteDisplay.textContent = wpm.toFixed(2);
    }

    function updateAccuracyDisplay(accuracy) {
        accuracyDisplay.textContent = accuracy.toFixed(2) + '%';
    }

    timer.addEventListener("change", () => {
        setTimer(timer.value);
        updateTimeDisplay(timer.value);
    });

    resetBtn.addEventListener("click", function () {
        setTimer(timer.value);
        setTimerStarted(false);
        typingInput.disabled = false;
        typingInput.value = "";
        updateTimeDisplay(getTimeLeft());
        updateWPMDisplay(0);
        updateAccuracyDisplay(100);
        resetWordsPerMinute();
        resetAccuracy();
        // Reset text colors
        resetDisplayTextColor(textDisplayChars);
    });  

    typingInput.addEventListener('input', () => {
        if (!isTimerStarted() && typingInput.value.length > 0) {
            setTimerStarted(true);
            updateTestStartTime();
            startTimer( (timeLeft) => {
                    const wpm = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
                    const accuracy = getRealTimeAccuracy();
                    updateTimeDisplay(timeLeft);
                    updateWPMDisplay(wpm);
                    updateAccuracyDisplay(accuracy);
                },
                () => {
                    typingInput.disabled = true;
                }
            );
        }
        validateCharacter(textDisplayChars, typingInput);
        
        // Update WPM and accuracy in real-time as user types
        if (isTimerStarted()) {
            const wpm = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
            const accuracy = getRealTimeAccuracy();
            wordsPerMinuteDisplay.textContent = wpm.toFixed(2);
            accuracyDisplay.textContent = accuracy.toFixed(2) + '%';
        }
    });
});

