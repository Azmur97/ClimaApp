/**
 * Punto de entrada principal de la aplicación.
 */

import { getCoordinates, getWeatherData } from './weatherApi.js';
import { elements, setLoading, showError, renderWeather } from './ui.js';

/**
 * Función principal que maneja la búsqueda de clima.
 * @param {Event} e - Evento de submit del formulario.
 */
async function handleWeatherSearch(e) {
    e.preventDefault();

    console.log("[main.js] Iniciando handleWeatherSearch");
    const cityName = elements.input.value.trim();
    console.log(`[main.js] Búsqueda iniciada para: "${cityName}"`);

    if (!cityName) {
        console.warn("[main.js] Intento de búsqueda con entrada vacía. Abortando.");
        showError("Por favor, introduce un nombre de ciudad.");
        return;
    }

    // 1. Mostrar estado de carga
    console.log("[main.js] Llamando a setLoading(true)");
    setLoading(true);

    try {
        // 2. Obtener coordenadas (Geocoding)
        console.log("[main.js] Solicitando coordenadas...");
        const location = await getCoordinates(cityName);
        console.log("[main.js] Coordenadas obtenidas:", location);

        // 3. Obtener clima con las coordenadas obtenidas
        console.log("[main.js] Solicitando clima actual...");
        const weather = await getWeatherData(location.lat, location.lon);
        console.log("[main.js] Clima obtenido:", weather);

        // 4. Renderizar resultados
        renderWeather(location.displayName, weather);
    } catch (error) {
        // 5. Manejar errores (ej. ciudad no encontrada)
        console.error("[main.js] Error durante el flujo de búsqueda:", error.message);
        showError(error.message);
    } finally {
        // 6. Quitar estado de carga
        console.log("[main.js] Llamando a setLoading(false)");
        setLoading(false);
        console.log("[main.js] Finalizando handleWeatherSearch");
    }
}

// Registro de eventos
elements.form.addEventListener("submit", handleWeatherSearch);
