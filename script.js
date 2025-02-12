const apiKey = '34a9731fd492e2266c584c8784f0653c';

// When the DOM loads, load the saved city (if any) and get weather data
document.addEventListener('DOMContentLoaded', () => {
  const savedCity = localStorage.getItem('lastCity');
  if (savedCity) {
    document.getElementById('city').value = savedCity;
    getWeather(savedCity);
  }
});

function getWeather(cityInput) {
  // Use the provided cityInput (when reloading) or read from the input field
  let city = cityInput || document.getElementById('city').value;
  if (!city) {
    alert('Please enter a city');
    return;
  }

  // Save the city to localStorage so it persists on refresh
  localStorage.setItem('lastCity', city);

  // URLs for current weather and forecast (in Fahrenheit)
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

  // Show the loading spinner
  document.getElementById('loading-spinner').classList.remove('hidden');

  // Fetch current weather
  fetch(currentWeatherUrl)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
    })
    .catch(error => {
      console.error('Error fetching current weather data:', error);
      alert('Error fetching current weather data. Please try again.');
    });

  // Fetch forecast data
  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
      displayWeeklyForecast(data.list);
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
      alert('Error fetching forecast data. Please try again.');
    })
    .finally(() => {
      // Hide the loading spinner after data has been fetched
      document.getElementById('loading-spinner').classList.add('hidden');
      // Hide the search bar after a successful lookup
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
    const temperature = Math.round(data.main.temp);
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

function displayWeeklyForecast(forecastData) {
  const weeklyForecastDiv = document.getElementById('weekly-forecast');
  weeklyForecastDiv.innerHTML = ''; // Clear previous forecast

  let dailyForecasts = {};

  // Group forecast entries (which are every 3 hours) by day (using weekday names)
  forecastData.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!dailyForecasts[day]) {
      dailyForecasts[day] = {
        minTemp: item.main.temp,
        maxTemp: item.main.temp,
        icon: item.weather[0].icon,
        description: item.weather[0].description
      };
    } else {
      dailyForecasts[day].minTemp = Math.min(dailyForecasts[day].minTemp, item.main.temp);
      dailyForecasts[day].maxTemp = Math.max(dailyForecasts[day].maxTemp, item.main.temp);
    }
  });

  // Get the first 7 unique days from the forecast
  let days = Object.keys(dailyForecasts).slice(0, 7);
  days.forEach(day => {
    const { minTemp, maxTemp, icon, description } = dailyForecasts[day];
    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

    const dailyItemHtml = `
      <div class="daily-item">
        <div class="day">${day}</div>
        <img src="${iconUrl}" alt="${description}">
        <div class="temp">${Math.round(maxTemp)}°F / ${Math.round(minTemp)}°F</div>
        <div class="desc">${description}</div>
      </div>
    `;
    weeklyForecastDiv.innerHTML += dailyItemHtml;
  });
}
