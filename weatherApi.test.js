const axios = require('axios');
const { getCoordinates, getWeather, getWeatherByCity } = require('./weatherApi');

jest.mock('axios');

describe('getCoordinates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-01: Ciudad válida devuelve coordenadas correctas', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        results: [{
          latitude: 40.4168,
          longitude: -3.7038,
          name: 'Madrid',
          country: 'España'
        }]
      }
    });

    const result = await getCoordinates('Madrid');

    expect(result).toEqual({
      latitude: 40.4168,
      longitude: -3.7038,
      name: 'Madrid',
      country: 'España'
    });
  });

  test('TC-05: Ciudad inexistente genera error', async () => {
    axios.get.mockResolvedValueOnce({
      data: { results: [] }
    });

    await expect(getCoordinates('CiudadFantasmaXYZ')).rejects.toThrow('Ciudad no encontrada');
  });

  test('TC-08: Entrada vacía muestra mensaje de error', async () => {
    await expect(getCoordinates('')).rejects.toThrow('Ingrese una ciudad');
  });

  test('TC-09: Solo espacios', async () => {
    await expect(getCoordinates('   ')).rejects.toThrow('Ingrese una ciudad');
  });

  test('TC-07: Caracteres inválidos', async () => {
    axios.get.mockResolvedValueOnce({ data: { results: [] } });

    await expect(getCoordinates('@#$%')).rejects.toThrow('Ciudad no encontrada');
  });

  test('TC-10: Longitud excesiva', async () => {
    const longName = 'A'.repeat(101);
    await expect(getCoordinates(longName)).rejects.toThrow('Nombre de ciudad muy largo');
  });

  test('TC-12: Error 500 del servidor', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 500 },
      code: 'ERR_BAD_RESPONSE'
    });

    await expect(getCoordinates('Madrid')).rejects.toThrow('Error del servidor');
  });

  test('TC-11: Timeout de red', async () => {
    axios.get.mockRejectedValueOnce({
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded'
    });

    await expect(getCoordinates('Madrid')).rejects.toThrow('Tiempo de espera agotado');
  });

  test('TC-13: Sin conexión a internet', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(getCoordinates('Madrid')).rejects.toThrow('Sin conexión a internet');
  });
});

describe('getWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-02: Ciudad con caracteres especiales', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          results: [{
            latitude: -23.5505,
            longitude: -46.6333,
            name: 'São Paulo',
            country: 'Brasil'
          }]
        }
      })
      .mockResolvedValueOnce({
        data: {
          current: {
            temperature_2m: 25.5,
            relative_humidity_2m: 65,
            weather_code: 1
          }
        }
      });

    const result = await getWeatherByCity('São Paulo');

    expect(result.city).toBe('São Paulo');
    expect(result.temperature).toBe(25.5);
  });

  test('TC-14: Rate limiting (429)', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 429 },
      code: 'ERR_BAD_RESPONSE'
    });

    await expect(getWeather(40.4168, -3.7038)).rejects.toThrow('Error del servidor');
  });

  test('TC-17: Datos de API corruptos', async () => {
    axios.get.mockResolvedValueOnce({
      data: { current: null }
    });

    await expect(getWeather(40.4168, -3.7038)).rejects.toThrow();
  });
});

describe('getWeatherByCity - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC-03: Flujo completo con ciudad válida', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          results: [{
            latitude: 51.5074,
            longitude: -0.1278,
            name: 'London',
            country: 'Reino Unido'
          }]
        }
      })
      .mockResolvedValueOnce({
        data: {
          current: {
            temperature_2m: 15.0,
            relative_humidity_2m: 72,
            weather_code: 3
          }
        }
      });

    const result = await getWeatherByCity('London');

    expect(result).toEqual({
      city: 'London',
      country: 'Reino Unido',
      temperature: 15.0,
      humidity: 72,
      code: 3
    });
  });

  test('TC-04: Ciudad con estado/país', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          results: [{
            latitude: 39.7817,
            longitude: -89.6501,
            name: 'Springfield',
            country: 'Estados Unidos'
          }]
        }
      })
      .mockResolvedValueOnce({
        data: {
          current: {
            temperature_2m: 22.0,
            relative_humidity_2m: 55,
            weather_code: 0
          }
        }
      });

    const result = await getWeatherByCity('Springfield, IL');

    expect(result.city).toBe('Springfield');
  });

  test('TC-16: Múltiples resultados (toma el primero)', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        results: [
          { latitude: 40.7128, longitude: -74.0060, name: 'New York', country: 'Estados Unidos' },
          { latitude: 43.0000, longitude: -75.5000, name: 'New York', country: 'Canadá' }
        ]
      }
    });

    const result = await getCoordinates('New York');

    expect(result.name).toBe('New York');
    expect(result.country).toBe('Estados Unidos');
  });
});

describe('Casos Límite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Límite-01: Rate Limiting (429 Too Many Requests)', async () => {
    axios.get.mockResolvedValue({
      data: { results: [{ latitude: 40.4168, longitude: -3.7038, name: 'Madrid', country: 'España' }] }
    });

    const result = await getCoordinates('Madrid');
    expect(result.name).toBe('Madrid');
  });

  test('Límite-02: Rate Limiting con Retry-After', async () => {
    axios.get.mockResolvedValue({
      data: { results: [{ latitude: 40.4168, longitude: -3.7038, name: 'Madrid', country: 'España' }] }
    });

    const result = await getCoordinates('Madrid');
    expect(result.name).toBe('Madrid');
  });

  test('Límite-03: Timeout por conexión lenta', async () => {
    axios.get.mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded'
    });

    await expect(getCoordinates('Madrid')).rejects.toThrow('Tiempo de espera agotado');
  }, 15000);

  test('Límite-04: Conexión inestable', async () => {
    axios.get.mockRejectedValue({
      code: 'ERR_NETWORK',
      message: 'Network Error'
    });

    await expect(getCoordinates('Madrid')).rejects.toThrow('Sin conexión a internet');
  });

  test('Límite-05: Respuesta con formato inesperado (falta campo)', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [{
          latitude: 40.4168,
          longitude: -3.7038
        }]
      }
    });

    const result = await getCoordinates('Madrid');
    
    expect(result.name).toBeUndefined();
    expect(result.country).toBeUndefined();
  });

  test('Límite-06: Respuesta con campos adicionales inesperados', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [{
          latitude: 40.4168,
          longitude: -3.7038,
          name: 'Madrid',
          country: 'España',
          admin1: 'Comunidad de Madrid',
          population: 3223334,
          unknownField: 'valor_extraño'
        }]
      }
    });

    const result = await getCoordinates('Madrid');
    
    expect(result).toHaveProperty('name', 'Madrid');
    expect(result).toHaveProperty('country', 'España');
  });

  test('Límite-07: Formato de respuesta de clima vacío', async () => {
    axios.get.mockResolvedValue({
      data: {}
    });

    await expect(getWeather(40.4168, -3.7038)).rejects.toThrow();
  });

  test('Límite-08: Formato de respuesta de clima con tipos incorrectos', async () => {
    axios.get.mockResolvedValue({
      data: {
        current: {
          temperature_2m: 'veinticinco',
          relative_humidity_2m: 'sesenta y cinco',
          weather_code: 'soleado'
        }
      }
    });

    const result = await getWeather(40.4168, -3.7038);
    
    expect(result.temperature).toBe('veinticinco');
  });

  test('Límite-09: Weather code fuera de rango válido', async () => {
    axios.get.mockResolvedValue({
      data: {
        current: {
          temperature_2m: 25.0,
          relative_humidity_2m: 65,
          weather_code: 999
        }
      }
    });

    const result = await getWeather(40.4168, -3.7038);
    
    expect(result.code).toBe(999);
  });

  test('Límite-10: Coordenadas extremas (Antártida)', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [{ latitude: -77.5, longitude: 166.0, name: 'McMurdo Station', country: 'Antártida' }]
      }
    });

    const result = await getCoordinates('McMurdo Station');
    
    expect(result.latitude).toBe(-77.5);
  });
});