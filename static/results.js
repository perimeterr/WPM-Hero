document.addEventListener('DOMContentLoaded', () => {
    const replayBtn = document.getElementById('replay-btn');
    const newTestBtn = document.getElementById('new-test-btn');
    const backLink = document.querySelector('a[href="/"]');

    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');

    const finalWPM = parseFloat(localStorage.getItem('finalWPM')) || 0;
    const finalAccuracy = parseFloat(localStorage.getItem('finalAccuracy')) || 0;

    wpmDisplay.textContent = finalWPM.toFixed(2);
    accuracyDisplay.textContent = finalAccuracy.toFixed(2) + '%';
    
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
