import { useState, useEffect } from "react";
import "./App.css";
import { HiOutlineLocationMarker } from "react-icons/hi";


function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cache, setCache] = useState({}); // ⭐ NEW

  const getWeatherIcon = (type) => {
    if (type.includes("clear")) return "☀️";
    if (type.includes("cloud")) return "☁️";
    if (type.includes("rain")) return "🌧";
    if (type.includes("snow")) return "❄️";
    return "🌍";
  };

  // LOAD history
  useEffect(() => {
    const saved = localStorage.getItem("history");

    if (saved) {
      setHistory(JSON.parse(saved));
    }

    setIsLoaded(true);
  }, []);

  // SAVE history
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("history", JSON.stringify(history));
    }
  }, [history, isLoaded]);

  async function handleSearch(searchCity = city) {
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // normalize input
  searchCity = searchCity.trim().toLowerCase();

  if (!searchCity) {
    setError("Please enter a city");
    return;
  }

  if (weather && weather.name.toLowerCase() === searchCity) {
    return;
  }

  if (cache[searchCity]) {
    setWeather(cache[searchCity].weather);
    setForecast(cache[searchCity].forecast);
    return;
  }

  setLoading(true);
  setError("");
  setWeather(null);
  setForecast([]);

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();

    if (data.cod !== 200) {
      if (data.cod === "404") {
        setError("City not found");
      } else {
        setError("Error fetching weather");
      }
      setLoading(false);
      return;
    }

    setWeather(data);

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=metric`
    );

    const forecastData = await forecastRes.json();

    // safer forecast handling
    if (!forecastData.list) {
      setError("Error loading forecast");
      setLoading(false);
      return;
    }

    const daily = forecastData.list.filter((_, index) => index % 8 === 0);

    setForecast(daily);

    setCache((prev) => ({
      ...prev,
      [searchCity]: {
        weather: data,
        forecast: daily,
      },
    }));

    setHistory((prev) => {
      const filtered = prev.filter((c) => c !== searchCity);
      const updated = [searchCity, ...filtered];
      return updated.slice(0, 5);
    });

    setCity("");
  } catch (err) {
    setError("Something went wrong");
  }

  setLoading(false);
}
  return (
  <main className="app">
    <section className="weather-card" aria-label="Weather application card">
      <header className="header">
        <p>Weather App</p>
        <h1>Check Forecast</h1>
      </header>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name"
          aria-label="Search city"
          value={city}
          autoFocus
          onChange={(e) => {
            setCity(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button 
  aria-label="Search weather"
  onClick={() => handleSearch()}
        onClick={() => handleSearch()} disabled={!city || loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {history.length > 0 && (
        <section className="history" aria-label="Recent searches">
          <p>Recent searches</p>
          <div className="history-buttons">
            {history.map((item, index) => (
              <button key={index} 
              aria-label={`Search weather for ${item}`}
              onClick={() => handleSearch(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      {!weather && !loading && !error && (
        <div className="message-card">
          <p className="message">Search for a city to see weather</p>
        </div>
      )}

      {loading && (
  <div className="status-card loading-card">
    <p>Fetching weather data...</p>
  </div>
)}

{error && (
  <div className="status-card error-card">
    <p>{error}</p>
  </div>
)}

      {weather && (
        <section className="current-weather" aria-label="Current weather">
          <h2 className="city-name">
  <HiOutlineLocationMarker className="location-icon" />
  {weather.name}, {weather.sys.country}
</h2>

          <p className="temperature">
            {Math.round(weather.main.temp)}°C
          </p>

          <p className="description">
            {getWeatherIcon(weather.weather[0].main.toLowerCase())}{" "}
            {weather.weather[0].description}
          </p>

          <div className="weather-details">
            <div className="detail-card">
              <span>Feels Like</span>
              <strong>{Math.round(weather.main.feels_like)}°C</strong>
            </div>

            <div className="detail-card">
              <span>Humidity</span>
              <strong>{weather.main.humidity}%</strong>
            </div>

            <div className="detail-card">
              <span>Wind</span>
              <strong>{weather.wind.speed} m/s</strong>
            </div>

            <div className="detail-card">
              <span>Pressure</span>
              <strong>{weather.main.pressure} hPa</strong>
            </div>
          </div>
        </section>
      )}

      {forecast.length > 0 && (
        <section className="forecast" aria-label="Five day forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-list">
            {forecast.map((item, index) => (
              <article className="forecast-card" key={index}>
                <p className="day">
                  {new Date(item.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </p>
                <p className="forecast-temp">{Math.round(item.main.temp)}°C</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  </main>
);

}

export default App;
