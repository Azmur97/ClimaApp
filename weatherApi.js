const axios = require('axios');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

async function getCoordinates(cityName) {
  if (!cityName || cityName.trim() === '') {
    throw new Error('Ingrese una ciudad');
  }

  const trimmedCity = cityName.trim();
  
  if (trimmedCity.length > 100) {
    throw new Error('Nombre de ciudad muy largo');
  }

  try {
    const geoResponse = await axios.get(GEOCODING_URL, {
      params: { name: trimmedCity, count: 1, language: 'es', format: 'json' },
      timeout: 10000
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      throw new Error('Ciudad no encontrada');
    }

    const { latitude, longitude, name, country } = geoResponse.data.results[0];
    return { latitude, longitude, name, country };
  } catch (error) {
    if (error.message === 'Ciudad no encontrada') {
      throw error;
    } else if (error.response && error.response.status !== 404) {
      throw new Error('Error del servidor');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Sin conexión a internet');
    } else if (!error.response && !error.code) {
      throw new Error('Sin conexión a internet');
    }
    throw error;
  }
}

async function getWeather(latitude, longitude) {
  try {
    const weatherResponse = await axios.get(WEATHER_URL, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code',
        timezone: 'auto'
      },
      timeout: 10000
    });

    if (!weatherResponse.data.current) {
      throw new Error('Datos del clima no disponibles');
    }

    const { temperature_2m, relative_humidity_2m, weather_code } = weatherResponse.data.current;
    return {
      temperature: temperature_2m,
      humidity: relative_humidity_2m,
      code: weather_code
    };
  } catch (error) {
    if (error.response) {
      throw new Error('Error del servidor');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Sin conexión a internet');
    } else if (!error.response && !error.code) {
      throw new Error('Sin conexión a internet');
    }
    throw error;
  }
}

async function getWeatherByCity(cityName) {
  const coords = await getCoordinates(cityName);
  const weather = await getWeather(coords.latitude, coords.longitude);
  return {
    city: coords.name,
    country: coords.country,
    ...weather
  };
}

module.exports = { getCoordinates, getWeather, getWeatherByCity };