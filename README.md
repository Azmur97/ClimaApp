# 🌦️ ClimaApp - Tu pronóstico hoy

ClimaApp es una aplicación web moderna y sencilla que permite a los usuarios consultar el clima actual de cualquier ciudad del mundo. Utiliza la potente API de **Open-Meteo** para obtener datos precisos de temperatura y estado del clima a partir del nombre de una ciudad, integrando un servicio de geolocalización automático.

## 📋 Resumen del Proyecto

Este proyecto combina una interfaz web intuitiva con una lógica robusta de integración de APIs. El flujo de la aplicación consiste en:
1.  **Geocoding:** Convertir el nombre de la ciudad ingresado por el usuario en coordenadas (latitud y longitud).
2.  **Weather Fetching:** Obtener los datos meteorológicos actuales utilizando las coordenadas obtenidas.
3.  **UI Rendering:** Presentar la información de manera clara y estética al usuario.

### 🏗️ Arquitectura y Estructura

La aplicación está diseñada con una arquitectura modular para facilitar su mantenimiento y pruebas:

```text
/
├── index.html          # Punto de entrada de la aplicación web
├── weatherApi.js       # Implementación para Node.js (Axios / CommonJS) - Usado para Tests
├── weatherApi.test.js  # Pruebas unitarias con Jest
├── js/
│   ├── main.js         # Orquestador del flujo principal y eventos del DOM
│   ├── weatherApi.js   # Cliente de API para el navegador (Fetch / ES Modules)
│   └── ui.js           # Lógica de manipulación del DOM y renderizado
├── css/
│   └── styles.css      # Estilos visuales
└── plans/
    └── plan.md         # Documentación de planificación inicial
```

> **Nota técnica:** El proyecto utiliza una implementación dual para la lógica de API: la versión en `js/` utiliza `fetch` nativo para compatibilidad total con navegadores modernos, mientras que la versión en la raíz utiliza `axios` para facilitar las pruebas automáticas en el entorno de Node.js.

## 🚀 Instrucciones de Instalación

Para ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Azmur97/ClimaApp
    cd ClimaApp
    ```

2.  **Instalar dependencias (necesario para tests):**
    ```bash
    npm install
    ```

3.  **Ejecutar la aplicación:**
    -   **Versión Web:** Simplemente abre el archivo `index.html` en tu navegador o usa una extensión como *Live Server* en VS Code.
    -   **Pruebas unitarias (Jest):** Para verificar la lógica de la API en Node.js, ejecuta:
        ```bash
        npm test
        ```

## 📖 Guía de Uso

1.  Abre la aplicación en el navegador.
2.  En el campo de búsqueda, escribe el nombre de la ciudad que deseas consultar (ej. "Madrid", "Ciudad de México", "Tokyo").
3.  Haz clic en el botón **"Buscar"** o presiona **Enter**.
4.  La aplicación mostrará un estado de carga mientras obtiene los datos.
5.  Una vez completado, verás la temperatura actual y la descripción del clima en una tarjeta visual.

## 📊 Ejemplo de Resultados

Al buscar una ciudad como **Madrid, España**, obtendrás un resultado similar a:

*   **Ciudad:** Madrid, España
*   **Temperatura:** 18°C
*   **Estado:** Despejado ☀️

## ✨ Funcionalidades

*   🔍 **Búsqueda global:** Encuentra el clima de cualquier ubicación mediante su nombre.
*   🌍 **Geolocalización automática:** Traduce nombres de ciudades a coordenadas precisas.
*   💾 **Soporte de Caché:** Incluye lógica para almacenamiento local (localStorage) de resultados (preparado en `js/weatherApi.js`).
*   ⚠️ **Manejo de errores robusto:** Notificaciones claras para ciudades no encontradas o problemas de conexión.
*   ⏳ **Indicador de carga:** Feedback visual durante el procesamiento de solicitudes.
*   📜 **Logs de depuración:** Sistema de seguimiento detallado en la consola del navegador.
*   🧪 **Pruebas Unitarias:** Amplia cobertura de casos (éxito, errores 404, 500, timeouts) usando Jest.

## 🛠️ Mejoras Futuras

*   [ ] **Historial de búsquedas:** Visualizar las últimas ciudades consultadas.
*   [ ] **Pronóstico extendido:** Mostrar el clima para los próximos 5 días.
*   [ ] **Detección de ubicación:** Botón para obtener el clima basado en GPS actual.
*   [ ] **Humedad y Viento:** Integrar visualmente los datos adicionales de la API en la UI.
*   [ ] **Soporte multi-idioma:** Traducir la interfaz completamente.
*   [ ] **Modo Oscuro:** Tema visual adaptable.

---
Datos proporcionados por [Open-Meteo](https://open-meteo.com/).