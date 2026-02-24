document.addEventListener('DOMContentLoaded', () => {
    const textDisplayChars = document.querySelectorAll('.char');
    const typingInput = document.getElementById('typing-input');

    // Object for tracking mistyped keys
    const mistypedKeys = {};
    // Track indices already counted as mistakes
    const mistakeIndices = new Set();

    typingInput.addEventListener('input', () => {
        const userValue = typingInput.value.split('');
        
        textDisplayChars.forEach((charSpan, index) => {
            const userChar = userValue[index];
            const targetChar = charSpan.textContent.replace(/\u00A0/g, " ");

            if (userChar == null) {
                charSpan.style.color = 'black';
                mistakeIndices.delete(index);
            } else if (userChar === targetChar) {
                charSpan.style.color = 'green';
                mistakeIndices.delete(index);
            } else {
                charSpan.style.color = 'red';

                // Track mistyped key once per position, but allow recount after backspace
                if (!mistakeIndices.has(index)) {
                    if (!mistypedKeys[targetChar]) {
                        mistypedKeys[targetChar] = 0; 
                    } 
                    mistypedKeys[targetChar] += 1;
                    mistakeIndices.add(index);
                }
            }
        });

        console.log(mistypedKeys); // For debugging
    });
});

