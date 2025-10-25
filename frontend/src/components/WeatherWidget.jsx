/**
 * WeatherWidget - Displays current weather data for Bengaluru
 * Updates in real-time from WebSocket weather_update messages
 */

import './WeatherWidget.css';

function WeatherWidget({ weatherData }) {
  if (!weatherData) {
    return (
      <div className="weather-widget loading">
        <div className="weather-icon">🌤️</div>
        <div className="weather-info">
          <p className="weather-status">Loading weather...</p>
        </div>
      </div>
    );
  }

  // Get weather icon emoji based on OpenWeatherMap icon code
  const getWeatherEmoji = (icon) => {
    const iconMap = {
      '01d': '☀️',  // clear sky day
      '01n': '🌙',  // clear sky night
      '02d': '⛅',  // few clouds day
      '02n': '☁️',  // few clouds night
      '03d': '☁️',  // scattered clouds
      '03n': '☁️',
      '04d': '☁️',  // broken clouds
      '04n': '☁️',
      '09d': '🌧️',  // shower rain
      '09n': '🌧️',
      '10d': '🌦️',  // rain day
      '10n': '🌧️',  // rain night
      '11d': '⛈️',  // thunderstorm
      '11n': '⛈️',
      '13d': '❄️',  // snow
      '13n': '❄️',
      '50d': '🌫️',  // mist
      '50n': '🌫️'
    };
    return iconMap[icon] || '🌤️';
  };

  const emoji = getWeatherEmoji(weatherData.icon);
  const isSimulated = weatherData.status === 'simulated';

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <h3>🌦️ Live Weather</h3>
        {isSimulated && <span className="simulated-badge">DEMO</span>}
      </div>
      
      <div className="weather-main">
        <div className="weather-icon-large">{emoji}</div>
        <div className="weather-temp">
          <span className="temp-value">{weatherData.temperature}</span>
          <span className="temp-unit">°C</span>
        </div>
      </div>

      <div className="weather-description">
        {weatherData.description}
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-icon">🌡️</span>
          <div className="detail-info">
            <span className="detail-label">Feels Like</span>
            <span className="detail-value">{weatherData.feels_like}°C</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">💧</span>
          <div className="detail-info">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weatherData.humidity}%</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">💨</span>
          <div className="detail-info">
            <span className="detail-label">Wind Speed</span>
            <span className="detail-value">{weatherData.wind_speed} m/s</span>
          </div>
        </div>
      </div>

      <div className="weather-location">
        📍 {weatherData.city}
      </div>
    </div>
  );
}

export default WeatherWidget;

