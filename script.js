const apiKey = '34a9731fd492e2266c584c8784f0653c';

// Load last searched city from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
        document.getElementById('city').value = savedCity;
        getWeather(savedCity);
    }
});

function getWeather(cityInput) {
    let city = cityInput || document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    // Save city to localStorage so it persists on refresh
    localStorage.setItem('lastCity', city);

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    // Show loading spinner
    document.getElementById('loading-spinner').classList.remove('hidden');

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Error fetching forecast data. Please try again.');
        })
        .finally(() => {
            // Hide loading spinner after fetching data
            document.getElementById('loading-spinner').classList.add('hidden');
            // Hide the search bar after search
            document.getElementById('search-container').style.display = 'none';
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    // Clear previous content
    tempDivInfo.innerHTML = '';
    weatherInfoDiv.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp); // Fahrenheit
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        tempDivInfo.innerHTML = `<p>${temperature}°F</p>`;
        weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;

        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
        weatherIcon.style.display = 'block';
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = ''; // Clear previous data

    const next8Hours = hourlyData.slice(0, 8); // Display the next 8 forecast periods

    next8Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);

        // Convert time to 12-hour format
        let hour = dateTime.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Convert 24-hour to 12-hour format

        const temperature = Math.round(item.main.temp); // Fahrenheit
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00 ${ampm}</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°F</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}
