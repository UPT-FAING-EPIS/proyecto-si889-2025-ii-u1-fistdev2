import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/auth.fixtures';
import { testProjects, testBoards, testColumns, testTasks } from '../fixtures/project.fixtures';
import { login, createProject, navigateToProject, navigateToBoard, createTask } from '../utils/test-utils';

/**
 * Pruebas de tableros Kanban y tareas
 */
test.describe('Tableros Kanban y tareas', () => {
  
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

  test('Debe mostrar la lista de tableros del proyecto', async ({ page }) => {
    // Verificar que estamos en la página del proyecto
    await expect(page.locator('[data-testid="project-header"]')).toContainText(testProjects.valid.name);
    
    // Verificar que se muestra la sección de tableros
    await expect(page.locator('h2:has-text("Tableros")')).toBeVisible();
    
    // Verificar que se muestra el botón de crear tablero
    await expect(page.locator('[data-testid="create-board-button"]')).toBeVisible();
  });

  test('Debe permitir crear un nuevo tablero', async ({ page }) => {
    // Hacer clic en el botón de crear tablero
    await page.click('[data-testid="create-board-button"]');
    
    // Completar el formulario de creación de tablero
    await page.fill('input[name="name"]', testBoards.valid.name);
    await page.fill('textarea[name="description"]', testBoards.valid.description);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-board-button"]');
    
    // Verificar que el tablero se ha creado correctamente
    await expect(page.locator(`text=${testBoards.valid.name}`)).toBeVisible();
  });

  test('Debe permitir ver un tablero Kanban', async ({ page }) => {
    // Crear un tablero si no existe
    if (!(await page.isVisible(`text=${testBoards.valid.name}`))) {
      // Hacer clic en el botón de crear tablero
      await page.click('[data-testid="create-board-button"]');
      
      // Completar el formulario de creación de tablero
      await page.fill('input[name="name"]', testBoards.valid.name);
      await page.fill('textarea[name="description"]', testBoards.valid.description);
      
      // Hacer clic en el botón de guardar
      await page.click('[data-testid="save-board-button"]');
    }
    
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Verificar que estamos en la página del tablero
    await expect(page.locator('[data-testid="board-header"]')).toContainText(testBoards.valid.name);
    
    // Verificar que se muestra la descripción del tablero
    await expect(page.locator(`text=${testBoards.valid.description}`)).toBeVisible();
  });

  test('Debe permitir crear columnas en el tablero', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Hacer clic en el botón de añadir columna
    await page.click('[data-testid="add-column-button"]');
    
    // Completar el formulario de creación de columna
    await page.fill('input[name="name"]', testColumns[0].name);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-column-button"]');
    
    // Verificar que la columna se ha creado correctamente
    await expect(page.locator(`[data-testid="column-${testColumns[0].name}"]`)).toBeVisible();
    
    // Crear una segunda columna
    await page.click('[data-testid="add-column-button"]');
    await page.fill('input[name="name"]', testColumns[1].name);
    await page.click('[data-testid="save-column-button"]');
    
    // Verificar que la segunda columna se ha creado correctamente
    await expect(page.locator(`[data-testid="column-${testColumns[1].name}"]`)).toBeVisible();
  });

  test('Debe permitir crear tareas en una columna', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Verificar que existe al menos una columna
    if (!(await page.isVisible(`[data-testid="column-${testColumns[0].name}"]`))) {
      // Crear una columna
      await page.click('[data-testid="add-column-button"]');
      await page.fill('input[name="name"]', testColumns[0].name);
      await page.click('[data-testid="save-column-button"]');
    }
    
    // Crear una tarea en la primera columna
    await createTask(
      page, 
      testColumns[0].name, 
      testTasks.valid.title, 
      testTasks.valid.description
    );
    
    // Verificar que la tarea se ha creado correctamente
    await expect(page.locator(`text=${testTasks.valid.title}`)).toBeVisible();
  });

  test('Debe permitir ver los detalles de una tarea', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Verificar que existe la tarea
    if (!(await page.isVisible(`text=${testTasks.valid.title}`))) {
      // Crear una tarea
      await createTask(
        page, 
        testColumns[0].name, 
        testTasks.valid.title, 
        testTasks.valid.description
      );
    }
    
    // Hacer clic en la tarea para ver sus detalles
    await page.click(`text=${testTasks.valid.title}`);
    
    // Verificar que se muestra el modal de detalles de la tarea
    await expect(page.locator('[data-testid="task-details-modal"]')).toBeVisible();
    
    // Verificar que se muestra el título y la descripción de la tarea
    await expect(page.locator(`[data-testid="task-details-title"]`)).toContainText(testTasks.valid.title);
    await expect(page.locator(`[data-testid="task-details-description"]`)).toContainText(testTasks.valid.description);
  });

  test('Debe permitir editar una tarea', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Verificar que existe la tarea
    if (!(await page.isVisible(`text=${testTasks.valid.title}`))) {
      // Crear una tarea
      await createTask(
        page, 
        testColumns[0].name, 
        testTasks.valid.title, 
        testTasks.valid.description
      );
    }
    
    // Hacer clic en la tarea para ver sus detalles
    await page.click(`text=${testTasks.valid.title}`);
    
    // Hacer clic en el botón de editar tarea
    await page.click('[data-testid="edit-task-button"]');
    
    // Completar el formulario de edición de tarea
    await page.fill('input[name="title"]', testTasks.update.title);
    await page.fill('textarea[name="description"]', testTasks.update.description);
    
    // Seleccionar la prioridad alta
    await page.selectOption('select[name="priority"]', testTasks.update.priority);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-task-button"]');
    
    // Verificar que los cambios se han guardado
    await expect(page.locator(`text=${testTasks.update.title}`)).toBeVisible();
    
    // Hacer clic en la tarea actualizada para ver sus detalles
    await page.click(`text=${testTasks.update.title}`);
    
    // Verificar que se muestra la descripción actualizada
    await expect(page.locator(`[data-testid="task-details-description"]`)).toContainText(testTasks.update.description);
    
    // Verificar que se muestra la prioridad actualizada
    await expect(page.locator(`[data-testid="task-details-priority"]`)).toContainText(testTasks.update.priority);
  });

  test('Debe permitir mover una tarea entre columnas', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Verificar que existen al menos dos columnas
    if (!(await page.isVisible(`[data-testid="column-${testColumns[1].name}"]`))) {
      // Crear una segunda columna
      await page.click('[data-testid="add-column-button"]');
      await page.fill('input[name="name"]', testColumns[1].name);
      await page.click('[data-testid="save-column-button"]');
    }
    
    // Verificar que existe la tarea en la primera columna
    if (!(await page.isVisible(`[data-testid="column-${testColumns[0].name}"] text=${testTasks.update.title}`))) {
      // Crear una tarea en la primera columna
      await createTask(
        page, 
        testColumns[0].name, 
        testTasks.update.title, 
        testTasks.update.description
      );
    }
    
    // Obtener el elemento de la tarea
    const taskCard = page.locator(`[data-testid="column-${testColumns[0].name}"] [data-testid="task-card"]:has-text("${testTasks.update.title}")`);
    
    // Obtener la columna de destino
    const targetColumn = page.locator(`[data-testid="column-${testColumns[1].name}"]`);
    
    // Arrastrar la tarea a la segunda columna
    await taskCard.dragTo(targetColumn);
    
    // Verificar que la tarea se ha movido a la segunda columna
    await expect(page.locator(`[data-testid="column-${testColumns[1].name}"] text=${testTasks.update.title}`)).toBeVisible();
  });

  test('Debe permitir eliminar una tarea', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Crear una tarea para eliminar
    const taskToDelete = 'Tarea para eliminar';
    const taskDescription = 'Esta tarea será eliminada';
    
    await createTask(
      page, 
      testColumns[0].name, 
      taskToDelete, 
      taskDescription
    );
    
    // Verificar que la tarea se ha creado correctamente
    await expect(page.locator(`text=${taskToDelete}`)).toBeVisible();
    
    // Hacer clic en la tarea para ver sus detalles
    await page.click(`text=${taskToDelete}`);
    
    // Hacer clic en el botón de eliminar tarea
    await page.click('[data-testid="delete-task-button"]');
    
    // Confirmar la eliminación
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verificar que la tarea ya no aparece en el tablero
    await expect(page.locator(`text=${taskToDelete}`)).not.toBeVisible();
  });

  test('Debe permitir editar un tablero', async ({ page }) => {
    // Navegar al tablero
    await navigateToBoard(page, testBoards.valid.name);
    
    // Hacer clic en el botón de editar tablero
    await page.click('[data-testid="edit-board-button"]');
    
    // Completar el formulario de edición de tablero
    await page.fill('input[name="name"]', testBoards.update.name);
    await page.fill('textarea[name="description"]', testBoards.update.description);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-board-button"]');
    
    // Verificar que los cambios se han guardado
    await expect(page.locator('[data-testid="board-header"]')).toContainText(testBoards.update.name);
    await expect(page.locator(`text=${testBoards.update.description}`)).toBeVisible();
  });

  test('Debe permitir eliminar un tablero', async ({ page }) => {
    // Crear un tablero para eliminar
    const boardToDelete = 'Tablero para eliminar';
    const boardDescription = 'Este tablero será eliminado';
    
    // Hacer clic en el botón de crear tablero
    await page.click('[data-testid="create-board-button"]');
    
    // Completar el formulario de creación de tablero
    await page.fill('input[name="name"]', boardToDelete);
    await page.fill('textarea[name="description"]', boardDescription);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-board-button"]');
    
    // Verificar que el tablero se ha creado correctamente
    await expect(page.locator(`text=${boardToDelete}`)).toBeVisible();
    
    // Navegar al tablero
    await navigateToBoard(page, boardToDelete);
    
    // Hacer clic en el botón de eliminar tablero
    await page.click('[data-testid="delete-board-button"]');
    
    // Confirmar la eliminación
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verificar que somos redirigidos a la página del proyecto
    await expect(page.locator('[data-testid="project-header"]')).toContainText(testProjects.valid.name);
    
    // Verificar que el tablero ya no aparece en la lista
    await expect(page.locator(`text=${boardToDelete}`)).not.toBeVisible();
  });
});