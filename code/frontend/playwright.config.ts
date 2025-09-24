import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas automatizadas del sistema DevFlow
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/tests',
  /* Tiempo máximo de ejecución para cada test */
  timeout: 60 * 1000, // Aumentamos el timeout a 60 segundos
  /* Esperar a que la aplicación esté lista antes de ejecutar las pruebas */
  expect: {
    timeout: 15000 // Aumentamos el timeout de las expectativas a 15 segundos
  },
  /* Reportar resultados de las pruebas */
  reporter: 'html',
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para todas las navegaciones */
    baseURL: 'http://localhost:3002',
    /* Capturar screenshot solo en caso de fallo */
    screenshot: 'only-on-failure',
    /* Grabar video solo en caso de fallo */
    video: 'on-first-retry',
    /* Recolectar trazas en caso de fallo */
    trace: 'on-first-retry',
    /* Habilitar las peticiones de red */
    actionTimeout: 15000, // Establecemos un timeout para las acciones
    /* Configuración de navegación */
    navigationTimeout: 45000, // Aumentamos el timeout de navegación
  },
  /* Configuración de los proyectos de prueba */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Pruebas en dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  /* Configuración del servidor web */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true, // Reutilizar el servidor existente si ya está en ejecución
    timeout: 180 * 1000, // Aumentamos el timeout a 3 minutos
    stdout: 'pipe', // Mostrar la salida estándar
    stderr: 'pipe', // Mostrar la salida de error
  },
});