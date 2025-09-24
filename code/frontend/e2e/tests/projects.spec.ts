import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/auth.fixtures';
import { testProjects } from '../fixtures/project.fixtures';
import { login, createProject, navigateToProject } from '../utils/test-utils';

/**
 * Pruebas de gestión de proyectos
 */
test.describe('Gestión de proyectos', () => {
  
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión antes de cada prueba
    await login(page, testUsers.user.email, testUsers.user.password);
    
    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('Debe mostrar el dashboard con la lista de proyectos', async ({ page }) => {
    // Verificar que estamos en el dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verificar que se muestra el título del dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verificar que se muestra la sección de proyectos
    await expect(page.locator('h2:has-text("Mis Proyectos")')).toBeVisible();
    
    // Verificar que se muestra el botón de crear proyecto
    await expect(page.locator('[data-testid="create-project-button"]')).toBeVisible();
  });

  test('Debe permitir crear un nuevo proyecto', async ({ page }) => {
    // Crear un nuevo proyecto
    await createProject(page, testProjects.valid.name, testProjects.valid.description);
    
    // Verificar que el proyecto se ha creado correctamente
    await expect(page.locator(`text=${testProjects.valid.name}`)).toBeVisible();
    await expect(page.locator(`text=${testProjects.valid.description}`)).toBeVisible();
  });

  test('Debe mostrar un error al crear un proyecto sin nombre', async ({ page }) => {
    // Hacer clic en el botón de crear proyecto
    await page.click('[data-testid="create-project-button"]');
    
    // Completar el formulario de creación de proyecto sin nombre
    await page.fill('textarea[name="description"]', testProjects.invalid.description);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-project-button"]');
    
    // Verificar que se muestra un mensaje de error
    await expect(page.locator('text=El nombre del proyecto es obligatorio')).toBeVisible();
  });

  test('Debe permitir ver los detalles de un proyecto', async ({ page }) => {
    // Crear un nuevo proyecto si no existe
    if (!(await page.isVisible(`text=${testProjects.valid.name}`))) {
      await createProject(page, testProjects.valid.name, testProjects.valid.description);
    }
    
    // Navegar al proyecto
    await navigateToProject(page, testProjects.valid.name);
    
    // Verificar que estamos en la página del proyecto
    await expect(page.locator('[data-testid="project-header"]')).toContainText(testProjects.valid.name);
    
    // Verificar que se muestra la descripción del proyecto
    await expect(page.locator(`text=${testProjects.valid.description}`)).toBeVisible();
    
    // Verificar que se muestran las opciones de gestión del proyecto
    await expect(page.locator('[data-testid="edit-project-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-project-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-project-button"]')).toBeVisible();
  });

  test('Debe permitir editar un proyecto existente', async ({ page }) => {
    // Crear un nuevo proyecto si no existe
    if (!(await page.isVisible(`text=${testProjects.valid.name}`))) {
      await createProject(page, testProjects.valid.name, testProjects.valid.description);
    }
    
    // Navegar al proyecto
    await navigateToProject(page, testProjects.valid.name);
    
    // Hacer clic en el botón de editar proyecto
    await page.click('[data-testid="edit-project-button"]');
    
    // Completar el formulario de edición de proyecto
    await page.fill('input[name="name"]', testProjects.update.name);
    await page.fill('textarea[name="description"]', testProjects.update.description);
    
    // Hacer clic en el botón de guardar
    await page.click('[data-testid="save-project-button"]');
    
    // Verificar que se muestra un mensaje de éxito
    await expect(page.locator('text=Proyecto actualizado correctamente')).toBeVisible();
    
    // Verificar que los cambios se han guardado
    await expect(page.locator('[data-testid="project-header"]')).toContainText(testProjects.update.name);
    await expect(page.locator(`text=${testProjects.update.description}`)).toBeVisible();
  });

  test('Debe permitir eliminar un proyecto existente', async ({ page }) => {
    // Crear un nuevo proyecto para eliminar
    const projectToDelete = 'Proyecto para eliminar';
    const projectDescription = 'Este proyecto será eliminado';
    
    await createProject(page, projectToDelete, projectDescription);
    
    // Navegar al proyecto
    await navigateToProject(page, projectToDelete);
    
    // Hacer clic en el botón de eliminar proyecto
    await page.click('[data-testid="delete-project-button"]');
    
    // Confirmar la eliminación
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verificar que somos redirigidos al dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verificar que el proyecto ya no aparece en la lista
    await expect(page.locator(`text=${projectToDelete}`)).not.toBeVisible();
  });

  test('Debe permitir compartir un proyecto con otros usuarios', async ({ page }) => {
    // Crear un nuevo proyecto si no existe
    if (!(await page.isVisible(`text=${testProjects.valid.name}`))) {
      await createProject(page, testProjects.valid.name, testProjects.valid.description);
    }
    
    // Navegar al proyecto
    await navigateToProject(page, testProjects.valid.name);
    
    // Hacer clic en el botón de compartir proyecto
    await page.click('[data-testid="share-project-button"]');
    
    // Completar el formulario de compartir proyecto
    await page.fill('input[name="email"]', testUsers.projectManager.email);
    
    // Seleccionar el rol de colaborador
    await page.selectOption('select[name="role"]', 'collaborator');
    
    // Hacer clic en el botón de compartir
    await page.click('[data-testid="share-button"]');
    
    // Verificar que se muestra un mensaje de éxito
    await expect(page.locator('text=Invitación enviada correctamente')).toBeVisible();
    
    // Verificar que el usuario aparece en la lista de colaboradores
    await expect(page.locator(`text=${testUsers.projectManager.email}`)).toBeVisible();
  });

  test('Debe mostrar los proyectos compartidos con el usuario', async ({ page }) => {
    // Navegar a la sección de proyectos compartidos
    await page.click('text=Proyectos Compartidos');
    
    // Verificar que estamos en la sección de proyectos compartidos
    await expect(page.locator('h2:has-text("Proyectos Compartidos")')).toBeVisible();
    
    // Verificar que se muestra la lista de proyectos compartidos
    await expect(page.locator('[data-testid="shared-projects-list"]')).toBeVisible();
  });
});