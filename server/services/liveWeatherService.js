/**
 * Real-Time Agricultural Weather Service (Open-Meteo Integration)
 * Fetches real-time weather and forecast for Indian districts without requiring external paid API keys.
 * Provides agricultural advisory for spraying, harvesting, and crop drying.
 */

const DISTRICT_COORDINATES = {
  // Madhya Pradesh
  'indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  'dewas': { lat: 22.9676, lng: 76.0534, state: 'Madhya Pradesh' },
  'ujjain': { lat: 23.1765, lng: 75.7885, state: 'Madhya Pradesh' },
  'bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  'dhar': { lat: 22.5976, lng: 75.3038, state: 'Madhya Pradesh' },
  'khargone': { lat: 21.8219, lng: 75.6111, state: 'Madhya Pradesh' },
  'ratlam': { lat: 23.3315, lng: 75.0367, state: 'Madhya Pradesh' },
  'gwalior': { lat: 26.2183, lng: 78.1828, state: 'Madhya Pradesh' },
  'jabalpur': { lat: 23.1815, lng: 79.9864, state: 'Madhya Pradesh' },

  // Gujarat
  'rajkot': { lat: 22.3039, lng: 70.8022, state: 'Gujarat' },
  'gondal': { lat: 21.9619, lng: 70.7923, state: 'Gujarat' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  'vadodara': { lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  'junagadh': { lat: 21.5222, lng: 70.4579, state: 'Gujarat' },
  'amreli': { lat: 21.6032, lng: 71.2221, state: 'Gujarat' },

  // Maharashtra
  'nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  'solapur': { lat: 17.6599, lng: 75.9064, state: 'Maharashtra' },
  'amravati': { lat: 20.9374, lng: 77.7796, state: 'Maharashtra' },

  // Punjab
  'ludhiana': { lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  'khanna': { lat: 30.7022, lng: 76.2206, state: 'Punjab' },
  'amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  'jalandhar': { lat: 31.3260, lng: 75.5762, state: 'Punjab' },
  'bathinda': { lat: 30.2110, lng: 74.9455, state: 'Punjab' },

  // Rajasthan
  'kota': { lat: 25.2138, lng: 75.8648, state: 'Rajasthan' },
  'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, state: 'Rajasthan' },
  'bikaner': { lat: 28.0229, lng: 73.3119, state: 'Rajasthan' },
  'sri ganganagar': { lat: 29.9038, lng: 73.8772, state: 'Rajasthan' },

  // Delhi & NCR
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'north delhi': { lat: 28.7188, lng: 77.1645, state: 'Delhi' },

  // Karnataka
  'bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'bengaluru urban': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'mysuru': { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  'belagavi': { lat: 15.8497, lng: 74.4977, state: 'Karnataka' }
};

// Weather WMO codes to clear human descriptions
const WMO_CODE_MAP = {
  0: 'Clear Sky / Sunny',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  80: 'Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail'
};

const getCoordinatesForLocation = (district, state) => {
  const normDist = (district || '').toLowerCase().trim();
  if (DISTRICT_COORDINATES[normDist]) {
    return DISTRICT_COORDINATES[normDist];
  }

  // Check substring match
  for (const [key, val] of Object.entries(DISTRICT_COORDINATES)) {
    if (normDist.includes(key) || key.includes(normDist)) {
      return val;
    }
  }

  // Default to central India (Indore coordinates)
  return { lat: 22.7196, lng: 75.8577, state: state || 'Madhya Pradesh' };
};

const getLiveWeatherForLocation = async (district, state) => {
  try {
    const coords = getCoordinatesForLocation(district, state);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
    const data = await res.json();

    const curr = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round(curr.temperature_2m ?? 28);
    const humidity = Math.round(curr.relative_humidity_2m ?? 60);
    const precip = curr.precipitation ?? 0;
    const wind = Math.round(curr.wind_speed_10m ?? 10);
    const code = curr.weather_code ?? 1;
    const condition = WMO_CODE_MAP[code] || 'Partly Cloudy';

    const maxTemp = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : temp + 4;
    const minTemp = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : temp - 5;
    const rainProb = daily.precipitation_probability_max?.[0] ?? (precip > 0 ? 80 : 15);
    const rainSum = daily.precipitation_sum?.[0] ?? 0;

    let sprayFeasibility = 'SAFE';
    let sprayReason = 'Wind and humidity are optimal for spraying.';
    if (rainProb > 45 || precip > 1) {
      sprayFeasibility = 'AVOID';
      sprayReason = 'Rain forecasted. Chemical wash-off hazard.';
    } else if (wind > 20) {
      sprayFeasibility = 'AVOID';
      sprayReason = 'High winds (>20 km/h) cause chemical spray drift.';
    }

    return {
      success: true,
      location: {
        district: district || 'Local District',
        state: coords.state,
        lat: coords.lat,
        lng: coords.lng
      },
      current: {
        temperature: temp,
        humidity,
        precipitationMm: precip,
        windSpeedKmH: wind,
        condition,
        weatherCode: code
      },
      forecast: {
        maxTemperature: maxTemp,
        minTemperature: minTemp,
        rainProbabilityPercent: rainProb,
        expectedRainMm: rainSum
      },
      agriculturalAdvisory: {
        sprayFeasibility,
        sprayReason,
        harvestDryingStatus: (rainProb < 25 && humidity < 70) ? 'EXCELLENT' : 'MONITOR'
      }
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      fallback: {
        temperature: 29,
        humidity: 62,
        condition: 'Clear Sky / Sunny'
      }
    };
  }
};

module.exports = {
  getLiveWeatherForLocation,
  getCoordinatesForLocation
};
