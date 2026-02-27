let timeLeft = 0;
let timerStarted = false;
let countdown = null;
let testStartTime = null;

export function getTestStartTime() {
    return testStartTime;
}

export function updateTestStartTime() {
    testStartTime = Date.now();
}

export function setTimer(time) {
    timeLeft = time;
    timerStarted = false;
    clearInterval(countdown);
}

export function getTimeLeft() {
    return timeLeft;
}

export function setTimerStarted(boolean) {
    timerStarted = boolean;
}

export function isTimerStarted() {
    return timerStarted;
}

export function startTimer(onTick, onComplete) {
    countdown = setInterval(function () {
        timeLeft--;
        onTick(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdown);
            onComplete();
        }

    }, 1000);
}