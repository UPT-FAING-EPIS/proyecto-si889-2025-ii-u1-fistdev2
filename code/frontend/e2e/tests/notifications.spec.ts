import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/auth.fixtures';
import { testProjects } from '../fixtures/project.fixtures';
import { login, createProject, navigateToProject } from '../utils/test-utils';

/**
 * Pruebas de notificaciones
 */
test.describe('Notificaciones', () => {
  
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión antes de cada prueba
    await login(page, testUsers.user.email, testUsers.user.password);
    
    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('Debe mostrar el centro de notificaciones', async ({ page }) => {
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Verificar que se muestra el centro de notificaciones
    await expect(page.locator('[data-testid="notifications-center"]')).toBeVisible();
    
    // Verificar que se muestra el título del centro de notificaciones
    await expect(page.locator('text=Notificaciones')).toBeVisible();
  });

  test('Debe mostrar las notificaciones no leídas', async ({ page }) => {
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Verificar que se muestra la pestaña de no leídas
    await expect(page.locator('text=No leídas')).toBeVisible();
    
    // Hacer clic en la pestaña de no leídas
    await page.click('text=No leídas');
    
    // Verificar que se muestra la lista de notificaciones no leídas
    await expect(page.locator('[data-testid="unread-notifications-list"]')).toBeVisible();
  });

  test('Debe mostrar las notificaciones leídas', async ({ page }) => {
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Verificar que se muestra la pestaña de leídas
    await expect(page.locator('text=Leídas')).toBeVisible();
    
    // Hacer clic en la pestaña de leídas
    await page.click('text=Leídas');
    
    // Verificar que se muestra la lista de notificaciones leídas
    await expect(page.locator('[data-testid="read-notifications-list"]')).toBeVisible();
  });

  test('Debe permitir marcar una notificación como leída', async ({ page }) => {
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Hacer clic en la pestaña de no leídas
    await page.click('text=No leídas');
    
    // Verificar si hay notificaciones no leídas
    const hasUnreadNotifications = await page.isVisible('[data-testid="notification-item"]');
    
    if (hasUnreadNotifications) {
      // Obtener el texto de la primera notificación
      const notificationText = await page.locator('[data-testid="notification-item"]').first().textContent();
      
      // Hacer clic en el botón de marcar como leída
      await page.click('[data-testid="mark-read-button"]');
      
      // Verificar que se muestra un mensaje de éxito
      await expect(page.locator('text=Notificación marcada como leída')).toBeVisible();
      
      // Hacer clic en la pestaña de leídas
      await page.click('text=Leídas');
      
      // Verificar que la notificación aparece en la lista de leídas
      await expect(page.locator(`text=${notificationText}`)).toBeVisible();
    }
  });

  test('Debe permitir marcar todas las notificaciones como leídas', async ({ page }) => {
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Verificar si hay notificaciones no leídas
    const hasUnreadNotifications = await page.isVisible('[data-testid="notification-item"]');
    
    if (hasUnreadNotifications) {
      // Hacer clic en el botón de marcar todas como leídas
      await page.click('[data-testid="mark-all-read-button"]');
      
      // Verificar que se muestra un mensaje de éxito
      await expect(page.locator('text=Todas las notificaciones marcadas como leídas')).toBeVisible();
      
      // Verificar que no hay notificaciones no leídas
      await expect(page.locator('text=No tienes notificaciones no leídas')).toBeVisible();
    }
  });

  test('Debe recibir notificaciones al ser invitado a un proyecto', async ({ page, browser }) => {
    // Crear un nuevo proyecto para invitar a otro usuario
    const projectName = 'Proyecto para Invitación';
    await createProject(page, projectName, 'Proyecto para probar notificaciones de invitación');
    
    // Navegar al proyecto
    await navigateToProject(page, projectName);
    
    // Hacer clic en la pestaña de miembros
    await page.click('text=Miembros');
    
    // Hacer clic en el botón de invitar miembro
    await page.click('[data-testid="invite-member-button"]');
    
    // Completar el formulario de invitación
    await page.fill('input[name="email"]', testUsers.projectManager.email);
    
    // Seleccionar el rol de colaborador
    await page.selectOption('select[name="role"]', 'collaborator');
    
    // Hacer clic en el botón de invitar
    await page.click('[data-testid="send-invitation-button"]');
    
    // Verificar que se muestra un mensaje de éxito
    await expect(page.locator('text=Invitación enviada correctamente')).toBeVisible();
    
    // Cerrar sesión
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Iniciar sesión con el usuario invitado
    await login(page, testUsers.projectManager.email, testUsers.projectManager.password);
    
    // Verificar que hay un indicador de notificaciones no leídas
    await expect(page.locator('[data-testid="notifications-badge"]')).toBeVisible();
    
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Verificar que hay una notificación de invitación al proyecto
    await expect(page.locator(`text=Has sido invitado al proyecto ${projectName}`)).toBeVisible();
  });

  test('Debe recibir notificaciones de actividad en proyectos compartidos', async ({ page, browser }) => {
    // Crear un nuevo proyecto si no existe
    if (!(await page.isVisible(`text=${testProjects.valid.name}`))) {
      await createProject(page, testProjects.valid.name, testProjects.valid.description);
    }
    
    // Navegar al proyecto
    await navigateToProject(page, testProjects.valid.name);
    
    // Hacer clic en la pestaña de miembros
    await page.click('text=Miembros');
    
    // Verificar si el usuario ya está invitado
    const isInvited = await page.isVisible(`text=${testUsers.projectManager.email}`);
    
    if (!isInvited) {
      // Hacer clic en el botón de invitar miembro
      await page.click('[data-testid="invite-member-button"]');
      
      // Completar el formulario de invitación
      await page.fill('input[name="email"]', testUsers.projectManager.email);
      
      // Seleccionar el rol de colaborador
      await page.selectOption('select[name="role"]', 'collaborator');
      
      // Hacer clic en el botón de invitar
      await page.click('[data-testid="send-invitation-button"]');
      
      // Verificar que se muestra un mensaje de éxito
      await expect(page.locator('text=Invitación enviada correctamente')).toBeVisible();
    }
    
    // Realizar una actividad en el proyecto (por ejemplo, actualizar la descripción)
    await page.click('text=Detalles');
    await page.click('[data-testid="edit-project-button"]');
    await page.fill('textarea[name="description"]', 'Descripción actualizada para prueba de notificaciones');
    await page.click('[data-testid="save-project-button"]');
    
    // Verificar que se muestra un mensaje de éxito
    await expect(page.locator('text=Proyecto actualizado correctamente')).toBeVisible();
    
    // Cerrar sesión
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Iniciar sesión con el usuario colaborador
    await login(page, testUsers.projectManager.email, testUsers.projectManager.password);
    
    // Verificar que hay un indicador de notificaciones no leídas
    await expect(page.locator('[data-testid="notifications-badge"]')).toBeVisible();
    
    // Hacer clic en el icono de notificaciones
    await page.click('[data-testid="notifications-icon"]');
    
    // Verificar que hay una notificación de actividad en el proyecto
    await expect(page.locator(`text=${testProjects.valid.name}`)).toBeVisible();
    await expect(page.locator('text=actualizado')).toBeVisible();
  });
});