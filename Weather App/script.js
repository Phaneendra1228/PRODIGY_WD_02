const searchInput = document.getElementById('search-input');
const locationBtn = document.getElementById('location-btn');
const bgOverlay = document.getElementById('bg-overlay');

// UI States
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const weatherContent = document.getElementById('weather-content');

// Weather Data Elements
const cityNameEl = document.getElementById('city-name');
const dateEl = document.getElementById('date');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weather-desc');
const tempMinEl = document.getElementById('temp-min');
const tempMaxEl = document.getElementById('temp-max');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const feelsLikeEl = document.getElementById('feels-like');
const pressureEl = document.getElementById('pressure');

// Event Listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        getWeatherByCity(searchInput.value.trim());
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showState(loadingState);
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByLocation(lat, lon);
            },
            error => {
                showError("Location access denied or unavailable.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

function showState(stateElement) {
    initialState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    weatherContent.classList.add('hidden');
    
    stateElement.classList.remove('hidden');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    showState(errorState);
}

// Map WMO weather codes to descriptions, icons, and backgrounds
function getWeatherDetails(code, isDay) {
    const isDaylight = isDay === 1;
    
    // Default to sunny/clear night if not found
    let details = { desc: 'Clear', icon: isDaylight ? 'bx-sun' : 'bx-moon', bg: isDaylight ? 'bg-sunny' : 'bg-clear-night' };
    
    if (code === 0) details = { desc: 'Clear sky', icon: isDaylight ? 'bx-sun' : 'bx-moon', bg: isDaylight ? 'bg-sunny' : 'bg-clear-night' };
    else if (code === 1) details = { desc: 'Mainly clear', icon: isDaylight ? 'bx-sun' : 'bx-moon', bg: isDaylight ? 'bg-sunny' : 'bg-clear-night' };
    else if (code === 2) details = { desc: 'Partly cloudy', icon: isDaylight ? 'bx-cloud' : 'bx-moon', bg: isDaylight ? 'bg-cloudy' : 'bg-clear-night' };
    else if (code === 3) details = { desc: 'Overcast', icon: 'bx-cloud', bg: 'bg-cloudy' };
    else if (code === 45 || code === 48) details = { desc: 'Fog', icon: 'bx-water', bg: 'bg-cloudy' };
    else if (code >= 51 && code <= 57) details = { desc: 'Drizzle', icon: 'bx-cloud-drizzle', bg: 'bg-rainy' };
    else if (code >= 61 && code <= 67) details = { desc: 'Rain', icon: 'bx-cloud-rain', bg: 'bg-rainy' };
    else if (code >= 71 && code <= 77) details = { desc: 'Snow', icon: 'bx-cloud-snow', bg: 'bg-snowy' };
    else if (code >= 80 && code <= 82) details = { desc: 'Rain showers', icon: 'bx-cloud-rain', bg: 'bg-rainy' };
    else if (code >= 85 && code <= 86) details = { desc: 'Snow showers', icon: 'bx-cloud-snow', bg: 'bg-snowy' };
    else if (code >= 95 && code <= 99) details = { desc: 'Thunderstorm', icon: 'bx-cloud-lightning', bg: 'bg-stormy' };

    return details;
}

// Format date
function formatDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

async function getWeatherByCity(city) {
    showState(loadingState);
    try {
        // Step 1: Geocode city name to coordinates
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found.");
        }
        
        const { latitude, longitude, name, country } = geoData.results[0];
        
        // Step 2: Fetch weather data using coordinates
        await fetchAndDisplayWeather(latitude, longitude, `${name}, ${country}`);
    } catch (error) {
        showError(error.message || "Failed to fetch weather data.");
    }
}

async function getWeatherByLocation(lat, lon) {
    try {
        // Reverse geocoding to get city name
        const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const geoData = await geoResponse.json();
        
        const city = geoData.city || geoData.locality || "Unknown Location";
        const country = geoData.countryCode || "";
        const locationName = country ? `${city}, ${country}` : city;
        
        await fetchAndDisplayWeather(lat, lon, locationName);
    } catch (error) {
        // Fallback if reverse geocoding fails
        await fetchAndDisplayWeather(lat, lon, "Current Location");
    }
}

async function fetchAndDisplayWeather(lat, lon, locationName) {
    try {
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        
        if (!weatherResponse.ok) {
            throw new Error("Weather data not available.");
        }
        
        const data = await weatherResponse.json();
        const current = data.current;
        const daily = data.daily;
        
        // Update UI
        cityNameEl.textContent = locationName;
        dateEl.textContent = formatDate();
        
        temperatureEl.textContent = Math.round(current.temperature_2m);
        tempMinEl.textContent = Math.round(daily.temperature_2m_min[0]);
        tempMaxEl.textContent = Math.round(daily.temperature_2m_max[0]);
        
        humidityEl.textContent = `${current.relative_humidity_2m}%`;
        windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
        feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°c`;
        pressureEl.textContent = `${Math.round(current.surface_pressure)} hPa`;
        
        // Update Icon, Description, and Background
        const weatherDetails = getWeatherDetails(current.weather_code, current.is_day);
        
        weatherDescEl.textContent = weatherDetails.desc;
        weatherIconEl.className = `bx ${weatherDetails.icon}`;
        
        // Remove all bg- classes and add the new one
        bgOverlay.className = `background-overlay ${weatherDetails.bg}`;
        
        showState(weatherContent);
    } catch (error) {
        showError(error.message || "Failed to load weather conditions.");
    }
}

// Check if search input was cleared
searchInput.addEventListener('input', (e) => {
    if (e.target.value === '') {
        showState(initialState);
        bgOverlay.className = 'background-overlay'; // Reset to default background
    }
});
