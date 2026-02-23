document.addEventListener('DOMContentLoaded', () => {
    const textDisplayChars = document.querySelectorAll('.char');
    const typingInput = document.getElementById('typing-input');

    typingInput.addEventListener('input', () => {
        const userValue = typingInput.value.split('');
        
        textDisplayChars.forEach((charSpan, index) => {
            const userChar = userValue[index];
            const targetChar = charSpan.textContent.replace(/\u00A0/g, " ");

            if (userChar == null) {
                charSpan.style.color = 'black';
            } else if (userChar === targetChar) {
                charSpan.style.color = 'green';
            } else {
                charSpan.style.color = 'red';
            }
        });
    });
});

