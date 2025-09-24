import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/auth.fixtures';
import { testProjects, testBoards, testTasks } from '../fixtures/project.fixtures';
import { login, createProject, navigateToProject, navigateToBoard, createTask } from '../utils/test-utils';

/**
 * Pruebas de funcionalidades de colaboración
 */
test.describe('Funcionalidades de colaboración', () => {
  
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión antes de cada prueba
    await login(page, testUsers.user.email, testUsers.user.password);
    
    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Crear un proyecto de prueba si no existe
    if (!(await page.isVisible(`text=${testProjects.valid.name}`))) {
      await createProject(page, testProjects.valid.name, testProjects.valid.description);
    }
    
    // Navegar al proyecto
    await navigateToProject(page, testProjects.valid.name);
  });

  test('Debe mostrar los miembros del proyecto', async ({ page }) => {
    // Hacer clic en la pestaña de miembros
    await page.click('text=Miembros');
    
    // Verificar que estamos en la sección de miembros
    await expect(page.locator('h2:has-text("Miembros del Proyecto")')).toBeVisible();
    
    // Verificar que se muestra la lista de miembros
    await expect(page.locator('[data-testid="members-list"]')).toBeVisible();
    
    // Verificar que el usuario actual aparece como propietario
    await expect(page.locator(`text=${testUsers.user.email}`)).toBeVisible();
    await expect(page.locator('text=Propietario')).toBeVisible();
  });

  test('Debe permitir invitar a un nuevo miembro al proyecto', async ({ page }) => {
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
  });

  test('Debe permitir cambiar el rol de un miembro del proyecto', async ({ page }) => {
    // Hacer clic en la pestaña de miembros
    await page.click('text=Miembros');
    
    // Verificar si el miembro ya existe
    const memberExists = await page.isVisible(`text=${testUsers.projectManager.email}`);
    
    if (memberExists) {
      // Hacer clic en el botón de editar rol
      await page.click(`[data-testid="edit-member-${testUsers.projectManager.email}"]`);
      
      // Seleccionar el rol de administrador
      await page.selectOption('select[name="role"]', 'admin');
      
      // Hacer clic en el botón de guardar
      await page.click('[data-testid="save-role-button"]');
      
      // Verificar que se muestra un mensaje de éxito
      await expect(page.locator('text=Rol actualizado correctamente')).toBeVisible();
      
      // Verificar que el rol se ha actualizado
      await expect(page.locator(`[data-testid="member-role-${testUsers.projectManager.email}"]`)).toContainText('Administrador');
    }
  });

  test('Debe permitir eliminar un miembro del proyecto', async ({ page }) => {
    // Hacer clic en la pestaña de miembros
    await page.click('text=Miembros');
    
    // Verificar si el miembro ya existe
    const memberExists = await page.isVisible(`text=${testUsers.projectManager.email}`);
    
    if (memberExists) {
      // Hacer clic en el botón de eliminar miembro
      await page.click(`[data-testid="remove-member-${testUsers.projectManager.email}"]`);
      
      // Confirmar la eliminación
      await page.click('[data-testid="confirm-remove-button"]');
      
      // Verificar que se muestra un mensaje de éxito
      await expect(page.locator('text=Miembro eliminado correctamente')).toBeVisible();
      
      // Verificar que el miembro ya no aparece en la lista
      await expect(page.locator(`text=${testUsers.projectManager.email}`)).not.toBeVisible();
    }
  });

  test('Debe permitir añadir comentarios a una tarea', async ({ page }) => {
    // Navegar al tablero
    if (!(await page.isVisible(`text=${testBoards.update.name}`))) {
      // Crear un tablero si no existe
      await page.click('[data-testid="create-board-button"]');
      await page.fill('input[name="name"]', testBoards.update.name);
      await page.fill('textarea[name="description"]', testBoards.update.description);
      await page.click('[data-testid="save-board-button"]');
    }
    
    await navigateToBoard(page, testBoards.update.name);
    
    // Verificar que existe al menos una columna y una tarea
    if (!(await page.isVisible(`text=${testTasks.update.title}`))) {
      // Crear una columna si no existe
      if (!(await page.isVisible(`[data-testid="column-Por hacer"]`))) {
        await page.click('[data-testid="add-column-button"]');
        await page.fill('input[name="name"]', 'Por hacer');
        await page.click('[data-testid="save-column-button"]');
      }
      
      // Crear una tarea
      await createTask(
        page, 
        'Por hacer', 
        testTasks.update.title, 
        testTasks.update.description
      );
    }
    
    // Hacer clic en la tarea para ver sus detalles
    await page.click(`text=${testTasks.update.title}`);
    
    // Hacer clic en la pestaña de comentarios
    await page.click('text=Comentarios');
    
    // Escribir un comentario
    const commentText = 'Este es un comentario de prueba';
    await page.fill('textarea[name="comment"]', commentText);
    
    // Enviar el comentario
    await page.click('[data-testid="send-comment-button"]');
    
    // Verificar que el comentario se ha añadido correctamente
    await expect(page.locator(`text=${commentText}`)).toBeVisible();
    
    // Verificar que se muestra el nombre del usuario que ha comentado
    await expect(page.locator(`[data-testid="comment-author"]:has-text("${testUsers.user.name}")`)).toBeVisible();
  });

  test('Debe mostrar los indicadores de presencia de usuarios', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.update.name);
    
    // Verificar que se muestra el indicador de presencia del usuario actual
    await expect(page.locator('[data-testid="presence-indicator"]')).toBeVisible();
    await expect(page.locator(`[data-testid="presence-user-${testUsers.user.email}"]`)).toBeVisible();
  });

  test('Debe mostrar el historial de actividad de una tarea', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.update.name);
    
    // Hacer clic en la tarea para ver sus detalles
    await page.click(`text=${testTasks.update.title}`);
    
    // Hacer clic en la pestaña de actividad
    await page.click('text=Actividad');
    
    // Verificar que se muestra el historial de actividad
    await expect(page.locator('[data-testid="activity-history"]')).toBeVisible();
    
    // Verificar que se muestra al menos una entrada de actividad
    await expect(page.locator('[data-testid="activity-item"]')).toBeVisible();
  });
});