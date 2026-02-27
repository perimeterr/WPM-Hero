import { validateCharacter } from "../../static/character_validator";

describe('Character Validator', () => {
    let displayElementChars;
    let typingInput;

    beforeEach(() => {
        displayElementChars = [
            { textContent: 'a', style: { color: 'black' } },
            { textContent: '\u00A0', style: { color: 'black' } }, 
            { textContent: 'b', style: { color: 'black' } }
        ];
        typingInput = { value: '' };
    });

    test('should mark incorrect input as red', () => {
        typingInput.value = 'z'; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('red');
    });

    test('should reset color to black when a character is deleted (backspace)', () => {
        displayElementChars[0].style.color = 'green';
        typingInput.value = ''; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('black');
    });

    test('should handle a mix of correct and incorrect characters', () => {
        typingInput.value = 'az'; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('green');
        expect(displayElementChars[1].style.color).toBe('red');
    });

    test('should correctly validate a regular space against a non-breaking space', () => {
        typingInput.value = 'a '; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[1].style.color).toBe('green');
    });

    test('should not change color for characters that have not been reached yet', () => {
        typingInput.value = 'a'; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('green');
        expect(displayElementChars[1].style.color).toBe('black');
        expect(displayElementChars[2].style.color).toBe('black');
    });
});