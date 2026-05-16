// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsList = document.getElementById('lapsList');
const statusDot = document.querySelector('.status-dot');

// State Variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let laps = [];
let lastLapTime = 0;

// Format Time Function
function formatTime(time) {
    const date = new Date(time);
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return { minutes, seconds, milliseconds };
}

// Update Display Function
function updateDisplay(time) {
    const formatted = formatTime(time);
    minutesDisplay.textContent = formatted.minutes;
    secondsDisplay.textContent = formatted.seconds;
    millisecondsDisplay.textContent = formatted.milliseconds;
}

// Timer Logic
function updateTimer() {
    const now = Date.now();
    const timeToDisplay = elapsedTime + (now - startTime);
    updateDisplay(timeToDisplay);
}

// Start / Stop Function
function toggleTimer() {
    if (isRunning) {
        // Pause
        clearInterval(timerInterval);
        elapsedTime += Date.now() - startTime;
        isRunning = false;
        
        // Update UI
        startStopBtn.innerHTML = '<span class="btn-text">Resume</span>';
        startStopBtn.classList.remove('running');
        statusDot.classList.remove('active');
        lapBtn.disabled = true;
    } else {
        // Start
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
        isRunning = true;
        
        // Update UI
        startStopBtn.innerHTML = '<span class="btn-text">Stop</span>';
        startStopBtn.classList.add('running');
        statusDot.classList.add('active');
        lapBtn.disabled = false;
        resetBtn.disabled = false;
    }
}

// Reset Function
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    laps = [];
    lastLapTime = 0;
    
    // Update UI
    updateDisplay(0);
    startStopBtn.innerHTML = '<span class="btn-text">Start</span>';
    startStopBtn.classList.remove('running');
    statusDot.classList.remove('active');
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    lapsList.innerHTML = '';
}

// Lap Function
function recordLap() {
    if (!isRunning) return;
    
    const now = Date.now();
    const currentTotalTime = elapsedTime + (now - startTime);
    const currentLapTime = currentTotalTime - lastLapTime;
    lastLapTime = currentTotalTime;
    
    // Add to laps array
    laps.unshift({
        total: currentTotalTime,
        diff: currentLapTime
    });
    
    renderLaps();
}

// Format a single time string (MM:SS.ms)
function formatTimeString(time) {
    const f = formatTime(time);
    return `${f.minutes}:${f.seconds}.${f.milliseconds}`;
}

// Render Laps to DOM
function renderLaps() {
    lapsList.innerHTML = '';
    
    // Find fastest and slowest lap times (only if more than 1 lap)
    let fastestLapIndex = -1;
    let slowestLapIndex = -1;
    
    if (laps.length > 1) {
        let minDiff = Infinity;
        let maxDiff = 0;
        
        laps.forEach((lap, index) => {
            // Ignore the current running lap if we wanted to be super accurate, 
            // but here we just style recorded laps.
            if (lap.diff < minDiff) { minDiff = lap.diff; fastestLapIndex = index; }
            if (lap.diff > maxDiff) { maxDiff = lap.diff; slowestLapIndex = index; }
        });
    }

    laps.forEach((lap, index) => {
        const li = document.createElement('li');
        li.className = 'lap-item';
        
        // Apply classes for min/max
        if (index === fastestLapIndex) li.classList.add('fastest');
        if (index === slowestLapIndex) li.classList.add('slowest');

        const lapNum = laps.length - index;
        const totalStr = formatTimeString(lap.total);
        const diffStr = formatTimeString(lap.diff);
        
        li.innerHTML = `
            <span class="lap-number">${String(lapNum).padStart(2, '0')}</span>
            <span class="lap-diff">+${diffStr}</span>
            <span class="lap-total">${totalStr}</span>
        `;
        
        lapsList.appendChild(li);
    });
}

// Event Listeners
startStopBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', recordLap);
