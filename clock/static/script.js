const API_URL = 'http://localhost:5000/api';
let is24HourFormat = true;
let updateInterval;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayClocks();
    startAutoUpdate();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('toggle-format').addEventListener('click', toggleTimeFormat);
    document.getElementById('refresh-btn').addEventListener('click', () => {
        fetchAndDisplayClocks();
    });
}

// Fetch time data from API
async function fetchAndDisplayClocks() {
    try {
        const response = await fetch(`${API_URL}/time`);
        if (!response.ok) throw new Error('Failed to fetch time data');
        
        const timeData = await response.json();
        displayClocks(timeData);
        updateLastRefreshTime();
    } catch (error) {
        console.error('Error fetching time data:', error);
        showError('Failed to load time data. Make sure the server is running.');
    }
}

// Display clocks
function displayClocks(timeData) {
    const container = document.getElementById('clocks-container');
    container.innerHTML = '';

    // Sort cities alphabetically
    const sortedCities = Object.keys(timeData).sort();

    sortedCities.forEach(city => {
        const data = timeData[city];
        const clockCard = createClockCard(city, data);
        container.appendChild(clockCard);
    });
}

// Create individual clock card
function createClockCard(city, timeData) {
    const card = document.createElement('div');
    card.className = 'clock-card';

    const displayTime = is24HourFormat ? timeData.time : timeData['12hour'];
    const offset = formatOffset(timeData.offset);

    card.innerHTML = `
        <div class="city-name">${city}</div>
        <div class="digital-time">${displayTime}</div>
        <div class="time-info">
            <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${timeData.date}</div>
            </div>
            <div class="info-item">
                <div class="info-label">UTC Offset</div>
                <div class="info-value">${offset}</div>
            </div>
        </div>
    `;

    return card;
}

// Toggle between 24-hour and 12-hour format
function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    const button = document.getElementById('toggle-format');
    button.textContent = is24HourFormat ? 'Switch to 12-Hour Format' : 'Switch to 24-Hour Format';
    fetchAndDisplayClocks();
}

// Format UTC offset
function formatOffset(offset) {
    if (!offset) return 'UTC';
    const sign = offset[0];
    const hours = offset.substring(1, 3);
    const minutes = offset.substring(3, 5);
    return `UTC${sign}${hours}:${minutes}`;
}

// Update last refresh time
function updateLastRefreshTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
    });
    document.getElementById('last-updated').textContent = timeString;
}

// Start auto-update interval
function startAutoUpdate() {
    updateInterval = setInterval(() => {
        fetchAndDisplayClocks();
    }, 1000); // Update every second
}

// Show error message
function showError(message) {
    const container = document.getElementById('clocks-container');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: white; padding: 40px;">
            <h2>⚠️ Error</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
    `;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
});
