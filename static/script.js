document.addEventListener('DOMContentLoaded', () => {
    const textDisplayChars = document.querySelectorAll('.char');
    const typingInput = document.getElementById('typing-input');
    const wordsPerMinuteDisplay = document.getElementById("wpm");
    const accuracyDisplay = document.getElementById("accuracy");
    const timeDisplay = document.getElementById("time");

    // Objects for tracking mistyped and correctly typed keys
    const mistypedKeys = {};
    const correctKeys = {};
    // Track indices already counted as mistakes and correct keys
    const mistakeIndices = new Set();
    const correctIndices = new Set();

    // function that computes the user's accuracy per key
    function getKeyAccuracy(key) {
        const correct = correctKeys[key] || 0;
        const mistakes = mistypedKeys[key] || 0;
        const total = correct + mistakes;
    
        if (total === 0) return null;
    
        return (correct / total) * 100;
    }

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

                // Track correct keys once per position in sample text
                if (!correctIndices.has(index)) {
                    if (!correctKeys[targetChar]) {
                        correctKeys[targetChar] = 0;
                    }
                    correctKeys[targetChar] += 1;
                    correctIndices.add(index);
                }

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

        // for debugging, will be removed in iteration 2
        console.log('Mistyped keys:', mistypedKeys); 
        console.log('Correct keys:', correctKeys);

        // Temporary test if accuracy works for letter 'a'
        let accuracy = getKeyAccuracy('a');

        if (accuracy === null) {
            console.log('Accuracy for "a": N/A');
        } else {
            console.log('Accuracy for "a": ' + accuracy.toFixed(2) + '%');
        }
    });
});

