import { getWordsPerMinute } from './wpm_calculation.js';
import { getCorrectIndicesSize, getRealTimeAccuracy, resetAccuracy, getMistypedKeys, getCorrectKeys } from './accuracy_calculation.js';
import { getTestStartTime, getTimeLeft, setTimer, setTimerStarted, isTimerStarted, startTimer } from './timer.js';
import { validateCharacter, resetDisplayTextColor } from './character_validator.js';

document.addEventListener('DOMContentLoaded', () => {
    const typingWrapper = document.getElementById('typing-wrapper');
    const textContent = document.getElementById('text-content');
    const typingInput = document.getElementById('typing-input');
    const wordsPerMinuteDisplay = document.getElementById("wpm");
    const accuracyDisplay = document.getElementById("accuracy");
    const timeDisplay = document.getElementById("time");
    const difficultySelect = document.getElementById("difficulty-select");
    const timerSelect = document.getElementById("timer-select");
    const customTextSelect = document.getElementById("custom-text-select");

    const allTexts = JSON.parse(document.getElementById('all-texts-data').textContent);
    const customTexts = JSON.parse(document.getElementById('custom-texts-data')?.textContent || '[]');

    if (customTextSelect && customTexts.length > 0) {
        customTexts.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.content.substring(0, 30) + '...';
            opt.dataset.difficulty = t.difficulty;
            customTextSelect.appendChild(opt);
        });
    }

    if (customTextSelect) {
    customTextSelect.addEventListener('change', () => {
            const selectedOption = customTextSelect.options[customTextSelect.selectedIndex];
            const difficulty = selectedOption.dataset.difficulty;

            if (difficulty) {
                difficultySelect.value = difficulty; // sync the difficulty dropdown
            }

            initializeTest();
        });
    }

    function getRandomText(difficulty) {
        const texts = allTexts[difficulty];
        if (!texts || texts.length === 0) return "No text available for this difficulty.";
        return texts[Math.floor(Math.random() * texts.length)].content;
    }

    function renderText(text) {
        textContent.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            textContent.appendChild(span);
        });
    }

    function getTextDisplayChars() {
        return document.querySelectorAll('.char');
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

    function saveTestSettings() {
        const settings = {
            difficulty: difficultySelect.value,
            timer: timerSelect.value,
            text: textContent.innerText
        };
        localStorage.setItem('testSettings', JSON.stringify(settings));
    }

    function initializeTest() {
        const difficulty = difficultySelect.value;
        const timerValue = timerSelect.value;

        if (localStorage.getItem('clickedReplay') === 'true') {
            const savedSettings = JSON.parse(localStorage.getItem('testSettings'));
            if (savedSettings) {
                difficultySelect.value = savedSettings.difficulty;
                timerSelect.value = savedSettings.timer;
                renderText(savedSettings.text);
            }
            localStorage.removeItem('clickedReplay');
        } else {
            const customId = customTextSelect?.value;
            if (customId) {
                const custom = customTexts.find(t => t.id == customId);
                renderText(custom ? custom.content : getRandomText(difficulty));
            } else {
                renderText(getRandomText(difficulty));
            }
        }

        setTimer(timerSelect.value);
        setTimerStarted(false);
        typingInput.disabled = false;
        typingInput.value = "";
        updateTimeDisplay(getTimeLeft());
        updateWPMDisplay(0);
        updateAccuracyDisplay(100);
        resetAccuracy();
        resetDisplayTextColor(getTextDisplayChars());
    }

    // Re-initialize when settings change
    difficultySelect.addEventListener('change', initializeTest);
    timerSelect.addEventListener('change', initializeTest);
    if (customTextSelect) {
        customTextSelect.addEventListener('change', initializeTest);
    }

    typingWrapper.addEventListener('click', () => typingInput.focus());

    typingInput.addEventListener('input', () => {
        const textDisplayChars = getTextDisplayChars();

        if (!isTimerStarted() && typingInput.value.length > 0) {
            saveTestSettings();
            startTimer(
                (timeLeft) => {
                    updateTimeDisplay(timeLeft);
                    updateWPMDisplay(getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime()));
                    updateAccuracyDisplay(getRealTimeAccuracy());
                },
                () => {
                    typingInput.disabled = true;

                    const finalWPM = getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime());
                    const finalAccuracy = getRealTimeAccuracy();
                    const finalMistypedKeys = getMistypedKeys();
                    const finalCorrectKeys = getCorrectKeys();

                    localStorage.setItem('finalWPM', finalWPM.toFixed(2));
                    localStorage.setItem('finalAccuracy', finalAccuracy.toFixed(2));
                    localStorage.setItem('finalMistypedKeys', JSON.stringify(finalMistypedKeys));
                    localStorage.setItem('finalCorrectKeys', JSON.stringify(finalCorrectKeys));

                    setTimeout(() => {
                        window.location.href = `/results/?difficulty=${difficultySelect.value}&timer=${timerSelect.value}`;
                    }, 50);
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

        if (isTimerStarted()) {
            updateWPMDisplay(getWordsPerMinute(getCorrectIndicesSize(), getTestStartTime()));
            updateAccuracyDisplay(getRealTimeAccuracy());
        }
    });

    initializeTest();
});