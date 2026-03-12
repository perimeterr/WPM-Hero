document.addEventListener('DOMContentLoaded', () => {
    const replayBtn = document.getElementById('replay-btn');
    const newTestBtn = document.getElementById('new-test-btn');
    const backLink = document.querySelector('a[href="/"]');
    
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const mistakeList = document.getElementById('mistake-list');

    const finalWPM = parseFloat(localStorage.getItem('finalWPM')) || 0;
    const finalAccuracy = parseFloat(localStorage.getItem('finalAccuracy')) || 0;
    const finalMistypedKeys = JSON.parse(localStorage.getItem('finalMistypedKeys')) || {};

    const mistakeEntries = Object.entries(finalMistypedKeys);

    wpmDisplay.textContent = finalWPM.toFixed(2);
    accuracyDisplay.textContent = finalAccuracy.toFixed(2) + '%';

    mistakeList.innerHTML = Object.entries(finalMistypedKeys)
        .map(([key, count]) => `
            <li>
                <strong>${key.toUpperCase()}</strong>: 
                Missed ${count} times 
            </li>
        `).join('');

    // Save results for logged in users
    if (isLoggedIn) {
        fetch('/save-result/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                difficulty: testDifficulty,
                timer: testTimer,
                wpm: finalWPM,
                accuracy: finalAccuracy,
                mistyped_keys: finalMistypedKeys
            })
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Save result response:', data);
        })
        .catch((error) => {
            console.error('Error saving result:', error);
        });
    } else {
        console.log('User not logged in. Results not saved.');
    }

    
    replayBtn.addEventListener('click', () => {
        // Set replay flag to restore previous settings
        localStorage.setItem('clickedReplay', 'true');
        window.location.href = '/';
    });
    
    newTestBtn.addEventListener('click', () => {
        // Clear saved settings for new test
        localStorage.removeItem('clickedReplay');
        localStorage.removeItem('testSettings');
        window.location.href = '/';
    });
    
    // Clear replay mode when using back link
    if (backLink) {
        backLink.addEventListener('click', (e) => {
            localStorage.removeItem('clickedReplay');
        });
    }
    

});

function getCSRFToken() {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length);
        }
    }

    return '';
}