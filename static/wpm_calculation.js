export function getWordsPerMinute(correctKeysTyped, testStartTime) {
    const timeElapsedInMinutes = (Date.now() - testStartTime) / 60000;
    const wordsTyped = correctKeysTyped / 5;
    const wpm = wordsTyped / timeElapsedInMinutes;
    return wpm;
}