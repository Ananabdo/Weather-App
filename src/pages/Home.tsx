import { useEffect, useState, type ChangeEvent } from "react";
import { fetchCities, fetchWeather } from "../services/api";
import { addToHistory } from "../services/history";
import type { City, Weather } from "../types";

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [selected, setSelected] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingCities(false));
  }, []);

  async function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const locality = e.target.value;
    setSelected(locality);
    setWeather(null);
    setError("");
    if (!locality) return;

    setLoadingWeather(true);
    try {
      const result = await fetchWeather(locality);
      setWeather(result);
      addToHistory({
        time: new Date().toISOString(),
        city: locality,
        country: result.country,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingWeather(false);
    }
  }

  return (
    <main className="page">
      <h1 className="title">Current Weather in Israel</h1>
      <p className="subtitle">Choose a locality to see its weather right now.</p>

      <div className="card select-card">
        <label htmlFor="city">Locality</label>
        <select id="city" value={selected} onChange={handleChange} disabled={loadingCities}>
          <option value="">
            {loadingCities ? "Loading localities…" : `Select a locality (${cities.length})`}
          </option>
          {cities.map((c) => (
            <option key={`${c.nameHe}-${c.nameEn}`} value={c.nameEn}>
              {c.nameHe} · {c.nameEn}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="card error">⚠ {error}</div>}

      {loadingWeather && (
        <div className="card weather loading">
          <div className="spinner" />
          <p>Checking the sky…</p>
        </div>
      )}

      {weather && (
        <div className="card weather">
          <div className="weather-main">
            {weather.icon.startsWith("http") ? (
              <img src={weather.icon} alt={weather.condition} />
            ) : (
              <div className="weather-emoji" aria-label={weather.condition} role="img">
                {weather.icon}
              </div>
            )}
            <div>
              <div className="temp">{weather.tempC}°C</div>
              <div className="condition">{weather.condition}</div>
            </div>
          </div>
          <div className="location">
            <h2>{weather.city}</h2>
            <span>{weather.country}</span>
          </div>
          <div className="details">
            <div>
              <span className="label">Country</span>
              <span>{weather.country}</span>
            </div>
            <div>
              <span className="label">City</span>
              <span>{weather.city}</span>
            </div>
            <div>
              <span className="label">Wind</span>
              <span>{weather.windKph} kph</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
