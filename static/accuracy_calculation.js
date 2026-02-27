// Objects for tracking mistyped and correctly typed keys
const mistypedKeys = {};
const correctKeys = {};
// Track indices already counted as mistakes and correct keys
const mistakeIndices = new Set();
const correctIndices = new Set();

export function trackCorrectKey(key, index) {
    if (!correctIndices.has(index)) {
        if (!correctKeys[key]) {
            correctKeys[key] = 0;
        }
        correctKeys[key] += 1;
        correctIndices.add(index);
    }
}

export function trackMistypedKey(key, index) {
    if (!mistakeIndices.has(index)) {
        if (!mistypedKeys[key]) {
            mistypedKeys[key] = 0;  
        } 
        mistypedKeys[key] += 1;
        mistakeIndices.add(index);
    }
}

export function removeMistakeIndex(index) {
    mistakeIndices.delete(index);
}

export function getCorrectIndicesSize() {
    return correctIndices.size;
}

export function getKeyAccuracy(key) {
    const correct = correctKeys[key] || 0;
    const mistakes = mistypedKeys[key] || 0;
    const total = correct + mistakes;

    if (total === 0) return null;

    return (correct / total) * 100;
}

export function getRealTimeAccuracy() {
    const totalTyped = Object.values(correctKeys).reduce((a, b) => a + b, 0) + Object.values(mistypedKeys).reduce((a, b) => a + b, 0);
    const totalCorrect = Object.values(correctKeys).reduce((a, b) => a + b, 0);

    if (totalTyped === 0) {
        return 100;
    }

    const accuracy = (totalCorrect / totalTyped) * 100;
    return accuracy;
}

export function resetAccuracy() {
    for (let key in mistypedKeys) {
        mistypedKeys[key] = 0;
    }
    for (let key in correctKeys) {
        correctKeys[key] = 0;
    }
    mistakeIndices.clear();
    correctIndices.clear();
}