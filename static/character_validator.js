import { trackCorrectKey, trackMistypedKey, removeMistakeIndex } from "./accuracy_calculation.js";

export function validateCharacter(displayElementChars, typingInput) {
    const userValue = typingInput.value.split('');
        
    displayElementChars.forEach((charSpan, index) => {
        const userChar = userValue[index];
        const targetChar = charSpan.textContent.replace(/\u00A0/g, " ");

        if (userChar == null) {
            charSpan.style.color = 'black';
            removeMistakeIndex(index);
        } else if (userChar === targetChar) {
            charSpan.style.color = 'green';
            removeMistakeIndex(index);
            trackCorrectKey(targetChar, index);
        } else {
            charSpan.style.color = 'red';

            trackMistypedKey(targetChar, index);
        }
    });
}

export function resetDisplayTextColor(displayElementChars) {
    displayElementChars.forEach(charSpan => {
        charSpan.style.color = 'black';
    });
}