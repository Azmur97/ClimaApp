/**
 * Servicio para interactuar con las APIs de Open-Meteo
 */

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Obtiene las coordenadas (latitud y longitud) de una ciudad por su nombre.
 * @param {string} cityName - Nombre de la ciudad a buscar.
 * @returns {Promise<Object>} - Objeto con lat, lon y nombre formateado.
 */
export async function getCoordinates(cityName) {
    console.log(`[weatherApi.js] Buscando coordenadas para: "${cityName}"`);
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('[weatherApi.js] Error en respuesta de Geocoding API:', response.status, response.statusText);
            throw new Error('Error al conectar con el servicio de geolocalización');
        }
        
        const data = await response.json();
        console.log('[weatherApi.js] Datos de Geocoding recibidos:', data);
        
        if (!data.results || data.results.length === 0) {
            console.warn(`[weatherApi.js] No se encontraron resultados para "${cityName}"`);
            throw new Error(`No se encontró la ciudad: "${cityName}"`);
        }

        const { latitude, longitude, name, country } = data.results[0];
        console.log(`[weatherApi.js] Coordenadas encontradas: Lat ${latitude}, Lon ${longitude} para ${name}, ${country}`);
        return {
            lat: latitude,
            lon: longitude,
            displayName: `${name}, ${country}`
        };
    } catch (error) {
        console.error('[weatherApi.js] Fallo en getCoordinates:', error.message);
        throw error;
    }
}

/**
 * Obtiene los datos meteorológicos actuales basados en coordenadas.
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} - Datos del clima actual.
 */
export async function getWeatherData(lat, lon) {
    if (lat === undefined || lon === undefined || lat === null || lon === null) {
        throw new Error('Latitud y longitud son requeridas para obtener el clima');
    }

    console.log(`[weatherApi.js] Solicitando datos para Lat: ${lat}, Lon: ${lon}`);

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current_weather: true,
        temperature_unit: 'celsius',
        wind_speed_unit: 'kmh',
        precipitation_unit: 'mm',
        current: 'temperature,weathercode',
        timezone: 'auto'
    });
    const url = `${WEATHER_API_URL}?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorMsg = `Error API (${response.status}): ${response.statusText}`;
            console.error(`[weatherApi.js] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        if (!data || !data.current_weather) {
            console.warn('[weatherApi.js] Respuesta de API sin datos climáticos actuales:', data);
            throw new Error('La respuesta de la API no contiene datos del clima actual');
        }

        console.log('[weatherApi.js] Datos recibidos con éxito');
        return data.current_weather;

    } catch (error) {
        console.error(`[weatherApi.js] Error en getWeatherData: ${error.message}`);
        throw error;
    }
}

/**
 * Almacena y recupera datos de una API con caducidad basada en el tiempo.
 * @param {string} url - La URL de la API a la que se va a llamar.
 * @param {string} cacheKey - La clave única para almacenar/recuperar datos en localStorage.
 * @param {number} expirationTimeMs - Tiempo de caducidad en milisegundos. (Por defecto: 1 hora)
 * @returns {Promise<Object>} - Los datos de la API.
 */
export async function fetchWithCache(url, cacheKey, expirationTimeMs = 3600000) {
    if (!url || typeof url !== 'string') {
        throw new Error('URL es requerida y debe ser una cadena');
    }
    if (!cacheKey || typeof cacheKey !== 'string') {
        throw new Error('cacheKey es requerido y debe ser una cadena');
    }

    let cachedData;
    try {
        cachedData = localStorage.getItem(cacheKey);
    } catch (error) {
        console.warn(`[Cache] No se pudo acceder al localStorage: ${error.message}`);
    }

    const now = new Date().getTime();

    if (cachedData) {
        try {
            const { data, timestamp } = JSON.parse(cachedData);
            if (now - timestamp < expirationTimeMs) {
                console.log(`[Cache] Recuperando datos cacheados para: ${cacheKey}`);
                return data;
            } else {
                console.log(`[Cache] Datos cacheados caducados para: ${cacheKey}`);
                try {
                    localStorage.removeItem(cacheKey);
                } catch (e) {
                    console.warn(`[Cache] No se pudo eliminar el elemento caduco: ${e.message}`);
                }
            }
        } catch (error) {
            console.warn(`[Cache] Error al parsear datos cacheados: ${error.message}`);
        }
    }

    console.log(`[Cache] Obteniendo nuevos datos de la API para: ${cacheKey}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener datos de la API: ${response.statusText}`);
        }
        const data = await response.json();
        try {
            localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
        } catch (e) {
            console.warn(`[Cache] No se pudo guardar en localStorage: ${e.message}`);
        }
        return data;
    } catch (error) {
        console.error(`[Cache] Fallo al obtener datos para ${cacheKey}:`, error);
        throw error;
    }
}
