import { renderMissedKeys } from "./missed_keys.js";

document.addEventListener('DOMContentLoaded', () => {
    const replayBtn = document.getElementById('replay-btn');
    const newTestBtn = document.getElementById('new-test-btn');
    const backLink = document.querySelector('a[href="/"]');
    
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');

    const finalWPM = parseFloat(localStorage.getItem('finalWPM')) || 0;
    const finalAccuracy = parseFloat(localStorage.getItem('finalAccuracy')) || 0;
    const finalMistypedKeys = JSON.parse(localStorage.getItem('finalMistypedKeys')) || {};
    const finalCorrectKeys = JSON.parse(localStorage.getItem('finalCorrectKeys')) || {};

    wpmDisplay.textContent = finalWPM.toFixed(2);
    accuracyDisplay.textContent = finalAccuracy.toFixed(2);

    const keyErrors = {};
    for (const key of Object.keys(finalMistypedKeys)) {
        const wrong   = finalMistypedKeys[key] || 0;
        const correct = finalCorrectKeys[key]  || 0;
        const total   = wrong + correct;
        if (total > 0 && wrong > 0) {
            keyErrors[key] = Math.round((wrong / total) * 100);
        }
    }

    renderMissedKeys(keyErrors, 'missed-keys-container');

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
                mistyped_keys: finalMistypedKeys,
                correct_keys: finalCorrectKeys
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

export function getCSRFToken() {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length);
        }
    }

    return '';
}