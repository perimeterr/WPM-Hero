import { trackCorrectKey, trackMistypedKey, removeMistakeIndex } from "./accuracy_calculation.js";

export function validateCharacter(displayElementChars, typingInput) {
    const userValue = typingInput.value.split('');
    const currentIndex = userValue.length;
        
    displayElementChars.forEach((charSpan, index) => {
        const userChar = userValue[index];
        const targetChar = charSpan.textContent
            .replace(/\u00A0/g, " ")      
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"'); 

        if (charSpan.classList) {
            charSpan.classList.remove('current');
        }

        if (userChar == null) {
            charSpan.style.color = 'black';
            removeMistakeIndex(index);

            if (index === currentIndex) {
                if (charSpan.classList) {
                    charSpan.classList.add('current');
                }
            }
            
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