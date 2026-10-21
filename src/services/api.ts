import type { City, Weather } from "../types";

const CITIES_URL =
  "https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=5000";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  56: "🌧️",
  57: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️",
  67: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  77: "🌨️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

const WEATHER_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};

interface CityRecord {
  city_name_he: string;
  city_name_en: string;
}

interface GeoLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface GeoMatch {
  name?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  matchScore: number;
}

interface GovernmentRecord {
  city_code?: number;
  city_name_he?: string;
  city_name_en?: string;
  _id?: number;
}

interface OfficialCoordinateRecord {
  'סמל יישוב'?: number;
  'קואורדינטות'?: number | string;
}

function israeliGridToWgs84(
  easting: number,
  northing: number,
): { latitude: number; longitude: number } {
  const semiMajorAxis = 6_378_137;
  const flattening = 1 / 298.257222101;
  const scale = 1.0000067;
  const eccentricitySquared = flattening * (2 - flattening);
  const secondEccentricitySquared = eccentricitySquared / (1 - eccentricitySquared);
  const originLatitude = (31.73439361111111 * Math.PI) / 180;
  const originLongitude = (35.20451694444445 * Math.PI) / 180;

  function meridionalArc(latitude: number): number {
    return semiMajorAxis * (
      (1 - eccentricitySquared / 4 - (3 * eccentricitySquared ** 2) / 64 - (5 * eccentricitySquared ** 3) / 256) * latitude -
        ((3 * eccentricitySquared) / 8 + (3 * eccentricitySquared ** 2) / 32 + (45 * eccentricitySquared ** 3) / 1024) * Math.sin(2 * latitude) +
        ((15 * eccentricitySquared ** 2) / 256 + (45 * eccentricitySquared ** 3) / 1024) * Math.sin(4 * latitude) -
        ((35 * eccentricitySquared ** 3) / 3072) * Math.sin(6 * latitude)
    );
  }

  const meridian = meridionalArc(originLatitude) + (northing - 626_907.39) / scale;
  const mu = meridian / (semiMajorAxis * (1 - eccentricitySquared / 4 - (3 * eccentricitySquared ** 2) / 64 - (5 * eccentricitySquared ** 3) / 256));
  const e1 = (1 - Math.sqrt(1 - eccentricitySquared)) / (1 + Math.sqrt(1 - eccentricitySquared));
  const footpointLatitude =
    mu +
    (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) +
    (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) +
    (151 * e1 ** 3 / 96) * Math.sin(6 * mu) +
    (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);

  const sinLatitude = Math.sin(footpointLatitude);
  const cosLatitude = Math.cos(footpointLatitude);
  const tanLatitude = Math.tan(footpointLatitude);
  const primeVerticalRadius = semiMajorAxis / Math.sqrt(1 - eccentricitySquared * sinLatitude ** 2);
  const meridianRadius = (semiMajorAxis * (1 - eccentricitySquared)) / (1 - eccentricitySquared * sinLatitude ** 2) ** 1.5;
  const tangentSquared = tanLatitude ** 2;
  const cosineTerm = secondEccentricitySquared * cosLatitude ** 2;
  const normalizedEasting = (easting - 219_529.584) / (primeVerticalRadius * scale);
  const latitude =
    footpointLatitude -
    (primeVerticalRadius * tanLatitude / meridianRadius) *
      (normalizedEasting ** 2 / 2 -
        (5 + 3 * tangentSquared + 10 * cosineTerm - 4 * cosineTerm ** 2 - 9 * secondEccentricitySquared) * normalizedEasting ** 4 / 24 +
        (61 + 90 * tangentSquared + 298 * cosineTerm + 45 * tangentSquared ** 2 - 252 * secondEccentricitySquared - 3 * cosineTerm ** 2) * normalizedEasting ** 6 / 720);

  const longitude =
    originLongitude +
    (normalizedEasting -
      (1 + 2 * tangentSquared + cosineTerm) * normalizedEasting ** 3 / 6 +
      (5 - 2 * cosineTerm + 28 * tangentSquared - 3 * cosineTerm ** 2 + 8 * secondEccentricitySquared + 24 * tangentSquared ** 2) * normalizedEasting ** 5 / 120) /
      cosLatitude;

  return {
    latitude: (latitude * 180) / Math.PI,
    longitude: (longitude * 180) / Math.PI,
  };
}

async function fetchOfficialLocalityLookup(): Promise<Array<{ nameHe: string; nameEn: string; latitude: number; longitude: number }>> {
  const [areaData, coordinateData] = await Promise.all([
    fetch("https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=5000"),
    fetch("https://data.gov.il/api/3/action/datastore_search?resource_id=d47a54ff-87f0-44b3-b33a-f284c0c38e5a&limit=5000"),
  ]);

  if (!areaData.ok || !coordinateData.ok) {
    throw new Error("Could not load Israeli localities.");
  }

  const [areaJson, coordinateJson] = await Promise.all([areaData.json(), coordinateData.json()]);
  const records = Array.isArray(areaJson?.result?.records) ? (areaJson.result.records as GovernmentRecord[]) : [];
  const coordinates = Array.isArray(coordinateJson?.result?.records)
    ? (coordinateJson.result.records as OfficialCoordinateRecord[])
    : [];

  const coordinateMap = new Map<number, { latitude: number; longitude: number }>();
  for (const item of coordinates) {
    const cityCode = item['סמל יישוב'];
    const grid = item['קואורדינטות'];
    if (typeof cityCode !== "number" || typeof grid === "undefined") continue;

    const digits = String(grid).replace(/\D/g, "");
    if (digits.length !== 12) continue;

    const easting = Number(digits.slice(0, 6));
    const northing = Number(digits.slice(6));
    if (easting < 100_000 || easting > 300_000 || northing < 500_000 || northing > 800_000) continue;

    const projected = israeliGridToWgs84(easting, northing);
    coordinateMap.set(cityCode, projected);
  }

  return records
    .map((record) => {
      const nameHe = (record.city_name_he ?? "").trim();
      const nameEn = (record.city_name_en ?? "").trim();
      const cityCode = record.city_code ?? record._id;
      const coords = typeof cityCode === "number" ? coordinateMap.get(cityCode) : undefined;
      if (!nameEn || !nameHe || !coords) return null;

      return { nameHe, nameEn, latitude: coords.latitude, longitude: coords.longitude };
    })
    .filter((entry): entry is { nameHe: string; nameEn: string; latitude: number; longitude: number } => Boolean(entry));
}

const LOCATION_ALIASES: Record<string, string[]> = {
  "Beer Sheva": ["Beersheba", "Be'er Sheva", "Beer-Sheva", "Beer Sheva, Israel"],
  "Beersheba": ["Beer Sheva", "Be'er Sheva", "Beer-Sheva", "Beer Sheva, Israel"],
  "Bnei Brak": ["Bnei Brak, Israel", "Bnei Brak Israel"],
  "Givataim": ["Giv‘atayim", "Giv’atayim", "Givatayim, Israel", "Givatayim Israel"],
  "Givatayim": ["Giv‘atayim", "Giv’atayim", "Givataim", "Givatayim, Israel", "Givatayim Israel"],
  "Rosh HaAyin": ["Rosh HaAyin, Israel", "Rosh HaAyin Israel", "Rosh HaAyin, IL"],
  "Modiin": ["Modiin Ilit", "Modiin, Israel", "Modiin Israel"],
  "Yokneam": ["Yokneam Illit", "Yokneam, Israel", "Yokneam Israel"],
  "Mitzpe Ramon": ["Mitzpe Ramon, Israel", "Mitzpe Ramon Israel"],
  "Eilat": ["Eilat, Israel", "Eilat Israel"],
  "Nazareth": ["Nazareth, Israel", "Nazareth Israel"],
  "Jerusalem": ["Jerusalem, Israel", "Jerusalem Israel"],
};

function normalizeLocationName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/&/g, "and")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getLocationCandidates(locality: string): string[] {
  const cleaned = locality.trim();
  const normalized = normalizeLocationName(cleaned);
  const normalizedLower = normalized.toLowerCase();
  const candidates = new Set<string>([
    cleaned,
    normalized,
    `${normalized}, Israel`,
    `${cleaned}, Israel`,
    `${cleaned} Israel`,
    `${normalized} Israel`,
    cleaned.replace(/\s+/g, " "),
    `"${cleaned}"`,
  ]);

  const aliasKeys = Object.keys(LOCATION_ALIASES);
  for (const aliasKey of aliasKeys) {
    const aliasLower = aliasKey.toLowerCase();
    const keyMatches =
      normalizedLower === aliasLower ||
      normalizedLower.includes(aliasLower) ||
      aliasLower.includes(normalizedLower);

    if (keyMatches) {
      for (const alias of LOCATION_ALIASES[aliasKey]) {
        candidates.add(alias);
        candidates.add(`${alias}, Israel`);
      }
    }
  }

  for (const direct of ["Beersheba", "Beer Sheva", "Be'er Sheva", "Bnei Brak", "Givataim", "Givatayim", "Rosh HaAyin", "Modiin", "Yokneam", "Mitzpe Ramon", "Eilat", "Jerusalem", "Nazareth"]) {
    const directLower = normalizeLocationName(direct).toLowerCase();
    if (normalizedLower === directLower || normalizedLower.includes(directLower) || directLower.includes(normalizedLower)) {
      candidates.add(direct);
      candidates.add(`${direct}, Israel`);
    }
  }

  return [...candidates].filter((value) => value && value.trim().length > 0);
}

function scoreMatch(locationName: string, locality: string): number {
  const base = normalizeLocationName(locationName).toLowerCase();
  const target = normalizeLocationName(locality).toLowerCase();

  if (base === target) return 100;
  if (base.includes(target) || target.includes(base)) return 80;
  const baseWords = new Set(base.split(" "));
  const targetWords = new Set(target.split(" "));
  const overlap = [...targetWords].filter((word) => baseWords.has(word)).length;
  return overlap * 10;
}

async function resolveLocation(locality: string): Promise<GeoLocation> {
  const officialLocalities = await fetchOfficialLocalityLookup().catch(() => []);
  const normalizedInput = normalizeLocationName(locality);

  const exactMatch = officialLocalities.find((item) => {
    const english = normalizeLocationName(item.nameEn);
    const hebrew = normalizeLocationName(item.nameHe);
    return english === normalizedInput || hebrew === normalizedInput || english.includes(normalizedInput) || hebrew.includes(normalizedInput);
  });

  if (exactMatch) {
    return {
      name: exactMatch.nameEn,
      country: "Israel",
      latitude: exactMatch.latitude,
      longitude: exactMatch.longitude,
    };
  }

  const candidates = getLocationCandidates(locality);
  for (const candidate of candidates) {
    const queryVariants = [
      `${GEO_URL}?name=${encodeURIComponent(candidate)}&countryCode=IL&count=10&language=en&format=json`,
      `${GEO_URL}?name=${encodeURIComponent(candidate)}&count=10&language=en&format=json`,
    ];

    for (const url of queryVariants) {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const matches = Array.isArray(data.results) ? data.results : [];
      const isInIsraelOrPalestine = (entry: { country_code?: string; country?: string }) =>
        entry.country_code === "IL" ||
        entry.country_code === "PS" ||
        /israel/i.test(entry.country ?? "") ||
        /palestinian/i.test(entry.country ?? "");

      const ranked = matches
        .filter(isInIsraelOrPalestine)
        .map((entry: GeoMatch) => ({
          ...entry,
          matchScore: scoreMatch(entry.name ?? "", locality),
        }))
        .sort((a: GeoMatch, b: GeoMatch) => b.matchScore - a.matchScore);

      if (ranked.length > 0) {
        const match = ranked[0];
        return {
          name: match.name ?? locality,
          country: match.country ?? "Israel",
          latitude: Number(match.latitude),
          longitude: Number(match.longitude),
        };
      }
    }
  }

  const fallback = `${locality}, Israel`;
  const url = `${GEO_URL}?name=${encodeURIComponent(fallback)}&count=10&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not find weather for ${locality}`);
  }
  const data = await res.json();
  const matches = Array.isArray(data.results) ? data.results : [];
  const match =
    matches.find(
      (entry: { country_code?: string; country?: string }) =>
        entry.country_code === "IL" || entry.country_code === "PS" || /israel/i.test(entry.country ?? "") || /palestinian/i.test(entry.country ?? ""),
    ) ?? matches[0];

  if (!match) throw new Error(`Could not find weather for ${locality}`);

  return {
    name: match.name ?? locality,
    country: match.country ?? "Israel",
    latitude: Number(match.latitude),
    longitude: Number(match.longitude),
  };
}

export async function fetchCities(): Promise<City[]> {
  const res = await fetch(CITIES_URL);
  if (!res.ok) throw new Error("Could not load the list of localities");
  const data = await res.json();

  const unique = new Map<string, City>();
  for (const record of data.result.records as CityRecord[]) {
    const nameHe = record.city_name_he?.trim() ?? "";
    const nameEn = record.city_name_en?.trim() ?? "";
    if (!nameEn || !nameHe) continue;
    const key = `${nameHe}::${nameEn}`;
    if (!unique.has(key)) {
      unique.set(key, { nameHe, nameEn });
    }
  }

  return [...unique.values()].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}

export async function fetchWeather(locality: string): Promise<Weather> {
  const location = await resolveLocation(locality);
  const weatherUrl = `${WEATHER_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;

  const res = await fetch(weatherUrl);
  if (!res.ok) {
    throw new Error("Could not load the weather");
  }

  const data = await res.json();
  const code = Number(data.current?.weather_code ?? 0);
  const weatherCondition = WEATHER_CONDITIONS[code] ?? "Weather";

  return {
    country: location.country,
    city: location.name,
    tempC: Number(data.current?.temperature_2m ?? 0),
    condition: weatherCondition,
    windKph: Number(data.current?.wind_speed_10m ?? 0),
    icon: WEATHER_ICONS[code] ?? WEATHER_ICONS[0],
  };
}
