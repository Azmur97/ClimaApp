/**
 * Módulo para manipular la UI.
 */

const elements = {
    form: document.getElementById('weather-form'),
    input: document.getElementById('city-input'),
    display: document.getElementById('weather-display'),
    cityName: document.getElementById('city-name'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('weather-description'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error-message')
};

/**
 * Muestra el estado de carga.
 * @param {boolean} isLoading 
 */
export function setLoading(isLoading) {
    if (isLoading) {
        elements.loading.classList.remove('hidden');
        elements.display.classList.add('hidden');
        elements.error.classList.add('hidden');
    } else {
        elements.loading.classList.add('hidden');
    }
}

/**
 * Muestra un mensaje de error.
 * @param {string} message 
 */
export function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.remove('hidden');
    elements.display.classList.add('hidden');
    elements.loading.classList.add('hidden');
}

/**
 * Mapeo de códigos de clima WMO a descripciones legibles.
 * Referencia: https://open-meteo.com/en/docs
 */
const weatherCodes = {
    0: 'Despejado ☀️',
    1: 'Principalmente despejado 🌤️',
    2: 'Parcialmente nublado ⛅',
    3: 'Nublado ☁️',
    45: 'Niebla 🌫️',
    48: 'Niebla con escarcha 🌫️❄️',
    51: 'Llovizna ligera 🌧️',
    53: 'Llovizna moderada 🌧️',
    55: 'Llovizna densa 🌧️',
    61: 'Lluvia ligera 🌦️',
    63: 'Lluvia moderada 🌧️',
    65: 'Lluvia fuerte 🌧️⚡',
    71: 'Nieve ligera 🌨️',
    73: 'Nieve moderada 🌨️',
    75: 'Nieve fuerte 🌨️❄️',
    80: 'Chubascos ligeros 🌦️',
    81: 'Chubascos moderados 🌧️',
    82: 'Chubascos violentos 🌧️🌊',
    95: 'Tormenta ⛈️'
};

/**
 * Renderiza los datos del clima en la tarjeta.
 * @param {string} city - Nombre de la ciudad.
 * @param {Object} weatherData - Datos de current_weather.
 */
export function renderWeather(city, weatherData) {
    elements.cityName.textContent = city;
    elements.temperature.textContent = Math.round(weatherData.temperature);
    
    const condition = weatherCodes[weatherData.weathercode] || 'Clima variable';
    elements.description.textContent = condition;
    
    elements.display.classList.remove('hidden');
    elements.error.classList.add('hidden');
}

export { elements };
