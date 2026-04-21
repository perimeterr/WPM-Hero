import { validateCharacter } from "../../static/character_validator";

describe('Character Validator', () => {
    let displayElementChars;
    let typingInput;

    beforeEach(() => {
        displayElementChars = [
            { textContent: 'a', style: { color: 'gray' } },
            { textContent: '\u00A0', style: { color: 'gray' } }, 
            { textContent: 'b', style: { color: 'gray' } }
        ];
        typingInput = { value: '' };
    });

    test('should mark incorrect input as red', () => {
        typingInput.value = 'z'; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('red');
    });

    test('should reset color to black when a character is deleted (backspace)', () => {
        displayElementChars[0].style.color = 'white';
        typingInput.value = ''; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('gray');
    });

    test('should handle a mix of correct and incorrect characters', () => {
        typingInput.value = 'az'; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('white');
        expect(displayElementChars[1].style.color).toBe('red');
    });

    test('should correctly validate a regular space against a non-breaking space', () => {
        typingInput.value = 'a '; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[1].style.color).toBe('white');
    });

    test('should not change color for characters that have not been reached yet', () => {
        typingInput.value = 'a'; 
        validateCharacter(displayElementChars, typingInput);
        expect(displayElementChars[0].style.color).toBe('white');
        expect(displayElementChars[1].style.color).toBe('gray');
        expect(displayElementChars[2].style.color).toBe('gray');
    });
});