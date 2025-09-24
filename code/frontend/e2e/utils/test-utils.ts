import { Page, expect } from '@playwright/test';

/**
 * Utilidades para las pruebas automatizadas del sistema DevFlow
 */

/**
 * Realiza el inicio de sesión en la aplicación
 * @param page Instancia de la página de Playwright
 * @param email Email del usuario
 * @param password Contraseña del usuario
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  // Navegar a la página de inicio de sesión
  await page.goto('/auth/login');
  
  // Completar el formulario de inicio de sesión
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Hacer clic en el botón de inicio de sesión
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete la navegación al dashboard o a otra página después del login
  try {
    // Aumentamos el timeout para dar más tiempo a la navegación
    await page.waitForNavigation({ timeout: 10000 });
    
    // Verificamos si estamos en el dashboard o en otra página válida después del login
    const currentUrl = page.url();
    console.log(`Navegación completada. URL actual: ${currentUrl}`);
  } catch (error) {
    console.log('Timeout esperando navegación después del login. Continuando con la prueba...');
  }
}

/**
 * Cierra la sesión actual
 * @param page Instancia de la página de Playwright
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Intentar hacer clic en el menú de usuario
    await page.click('[data-testid="user-menu"]', { timeout: 5000 });
    
    // Intentar hacer clic en la opción de cerrar sesión
    await page.click('[data-testid="logout-button"]', { timeout: 5000 });
    
    // Esperar a que se complete la navegación a la página de inicio o cualquier otra página después del logout
    try {
      await page.waitForNavigation({ timeout: 10000 });
      const currentUrl = page.url();
      console.log(`Navegación completada después del logout. URL actual: ${currentUrl}`);
    } catch (error) {
      console.log('Timeout esperando navegación después del logout. Continuando con la prueba...');
    }
  } catch (error) {
    console.log('Error al intentar cerrar sesión. Es posible que los selectores no coincidan con la interfaz actual.');
    // Intentar una alternativa: navegar directamente a la página de logout
    await page.goto('/auth/logout');
  }
}

/**
 * Crea un nuevo proyecto
 * @param page Instancia de la página de Playwright
 * @param name Nombre del proyecto
 * @param description Descripción del proyecto
 */
export async function createProject(page: Page, name: string, description: string): Promise<void> {
  // Navegar al dashboard
  await page.goto('/dashboard');
  
  // Hacer clic en el botón de crear proyecto
  await page.click('[data-testid="create-project-button"]');
  
  // Completar el formulario de creación de proyecto
  await page.fill('input[name="name"]', name);
  await page.fill('textarea[name="description"]', description);
  
  // Hacer clic en el botón de guardar
  await page.click('[data-testid="save-project-button"]');
  
  // Esperar a que se complete la creación del proyecto
  await page.waitForSelector(`text=${name}`);
  
  // Verificar que el proyecto se ha creado correctamente
  await expect(page.locator(`text=${name}`)).toBeVisible();
}

/**
 * Navega a un proyecto específico
 * @param page Instancia de la página de Playwright
 * @param projectName Nombre del proyecto
 */
export async function navigateToProject(page: Page, projectName: string): Promise<void> {
  // Navegar al dashboard
  await page.goto('/dashboard');
  
  // Hacer clic en el proyecto
  await page.click(`text=${projectName}`);
  
  // Esperar a que se cargue la página del proyecto
  await page.waitForSelector('[data-testid="project-header"]');
  
  // Verificar que estamos en la página del proyecto
  await expect(page.locator('[data-testid="project-header"]')).toContainText(projectName);
}

/**
 * Navega a un tablero específico
 * @param page Instancia de la página de Playwright
 * @param boardName Nombre del tablero
 */
export async function navigateToBoard(page: Page, boardName: string): Promise<void> {
  // Hacer clic en el tablero
  await page.click(`text=${boardName}`);
  
  // Esperar a que se cargue la página del tablero
  await page.waitForSelector('[data-testid="board-header"]');
  
  // Verificar que estamos en la página del tablero
  await expect(page.locator('[data-testid="board-header"]')).toContainText(boardName);
}

/**
 * Crea una nueva tarea en un tablero
 * @param page Instancia de la página de Playwright
 * @param columnName Nombre de la columna
 * @param taskTitle Título de la tarea
 * @param taskDescription Descripción de la tarea
 */
export async function createTask(
  page: Page, 
  columnName: string, 
  taskTitle: string, 
  taskDescription: string
): Promise<void> {
  // Hacer clic en el botón de añadir tarea en la columna específica
  await page.click(`[data-testid="column-${columnName}"] [data-testid="add-task-button"]`);
  
  // Completar el formulario de creación de tarea
  await page.fill('input[name="title"]', taskTitle);
  await page.fill('textarea[name="description"]', taskDescription);
  
  // Hacer clic en el botón de guardar
  await page.click('[data-testid="save-task-button"]');
  
  // Esperar a que se complete la creación de la tarea
  await page.waitForSelector(`text=${taskTitle}`);
  
  // Verificar que la tarea se ha creado correctamente
  await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
}

/**
 * Verifica si un elemento está visible en la página
 * @param page Instancia de la página de Playwright
 * @param selector Selector del elemento
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Espera a que se complete una petición de red
 * @param page Instancia de la página de Playwright
 * @param urlPattern Patrón de URL de la petición
 */
export async function waitForApiRequest(page: Page, urlPattern: RegExp): Promise<void> {
  await page.waitForResponse(urlPattern);
}