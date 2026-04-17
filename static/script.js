import { getWordsPerMinute } from './wpm_calculation.js';
import { getCorrectIndicesSize, getRealTimeAccuracy, resetAccuracy, getMistypedKeys } from './accuracy_calculation.js';
import { getTestStartTime, getTimeLeft, setTimer, setTimerStarted, isTimerStarted, startTimer } from './timer.js';
import { validateCharacter, resetDisplayTextColor } from './character_validator.js';

document.addEventListener('DOMContentLoaded', () => {
    const typingWrapper = document.getElementById('typing-wrapper');
    const textContent = document.getElementById('text-content');
    const textDisplayChars = document.querySelectorAll('.char');
    const typingInput = document.getElementById('typing-input');
    const wordsPerMinuteDisplay = document.getElementById("wpm");
    const accuracyDisplay = document.getElementById("accuracy");
    const timeDisplay = document.getElementById("time");
    const timer = document.getElementById("timer");

    let currentLine = 0;

    typingWrapper.addEventListener('click', () => typingInput.focus());

    function initializeTest() {
        if (localStorage.getItem('clickedReplay') === 'true') {
            const savedSettings = JSON.parse(localStorage.getItem('testSettings'));
            if (savedSettings) {
                document.getElementById('difficulty').value = savedSettings.difficulty;
                timer.value = savedSettings.timer;
                setTimer(timer.value);
                timeDisplay.textContent = getTimeLeft();
                accuracyDisplay.textContent = "100.00";
                wordsPerMinuteDisplay.textContent = "0.00";
                
                // Restore display text
                textDisplayChars.forEach((char, index) => {
                    char.textContent = savedSettings.displayText[index] || '';
                });
            }
        } else {
            resetTest();
        }
        setTimer(timer.value);
        timeDisplay.textContent = getTimeLeft();
        accuracyDisplay.textContent = "100.00";
        wordsPerMinuteDisplay.textContent = "0.00";
    }
    
    
    function updateTimeDisplay(time) {
        timeDisplay.textContent = time;
    }

    function updateWPMDisplay(wpm) {
        wordsPerMinuteDisplay.textContent = wpm.toFixed(2);
    }

    function updateAccuracyDisplay(accuracy) {
        accuracyDisplay.textContent = accuracy.toFixed(2);
    }

    function resetTest() {
        currentLine = 0; 
        if (textContent) {
            textContent.style.transform = `translateY(0px)`; 
        }
        setTimer(timer.value);
        setTimerStarted(false);
        typingInput.disabled = false;
        typingInput.value = "";
        updateTimeDisplay(getTimeLeft());
        updateWPMDisplay(0);
        updateAccuracyDisplay(100);
        resetAccuracy();
        resetDisplayTextColor(textDisplayChars);
    }
    
    function saveTestSettings() {
        const settings = {
            difficulty: document.getElementById('difficulty').value,
            timer: timer.value,
            displayText: Array.from(textDisplayChars).map(char => char.textContent).join('')
        };
        localStorage.setItem('testSettings', JSON.stringify(settings));
    }

    initializeTest();

    timer.addEventListener("change", () => {
        setTimer(timer.value);
        updateTimeDisplay(timer.value);
    }); 

    

    typingInput.addEventListener('input', () => {
        if (!isTimerStarted() && typingInput.value.length > 0) {
            saveTestSettings();
            startTimer( (timeLeft) => {
                    const wpm = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
                    const accuracy = getRealTimeAccuracy();
                    updateTimeDisplay(timeLeft);
                    updateWPMDisplay(wpm);
                    updateAccuracyDisplay(accuracy);
                },
                () => {
                    typingInput.disabled = true;

                    // get final wpm and accuracy when timer ends
                    const finalWPM = getWordsPerMinute(
                        getCorrectIndicesSize(),
                        getTestStartTime()
                    );
                
                    const finalAccuracy = getRealTimeAccuracy();

                    const finalMistypedKeys = getMistypedKeys();

                    localStorage.setItem('finalWPM', finalWPM.toFixed(2));
                    localStorage.setItem('finalAccuracy', finalAccuracy.toFixed(2));
                    localStorage.setItem('finalMistypedKeys', JSON.stringify(finalMistypedKeys));
                    const difficulty = document.getElementById('difficulty').value;
                    const timerValue = document.getElementById('timer').value;

                    window.location.href = `/results/?difficulty=${difficulty}&timer=${timerValue}`;
                }
            );
        }
        validateCharacter(textDisplayChars, typingInput);

        const currentIndex = typingInput.value.length;
        const currentCharEl = textDisplayChars[currentIndex];

        if (currentCharEl) {
            const actualLineHeight = currentCharEl.offsetHeight;
            const charTop = currentCharEl.offsetTop;
            
            const lineIndex = Math.floor(charTop / actualLineHeight);

            const currentBlock = Math.floor(lineIndex / 3);
            const scrollOffset = currentBlock * (actualLineHeight * 3);

            textContent.style.transform = `translateY(-${scrollOffset}px)`;
        }
        
        // Update WPM and accuracy in real-time as user types
        if (isTimerStarted()) {
            const wpm = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
            const accuracy = getRealTimeAccuracy();
            wordsPerMinuteDisplay.textContent = wpm.toFixed(2);
            accuracyDisplay.textContent = accuracy.toFixed(2);
        }
    });
});

