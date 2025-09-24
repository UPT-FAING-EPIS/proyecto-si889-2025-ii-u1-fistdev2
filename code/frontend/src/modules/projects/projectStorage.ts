'use client';

import { Project } from './project';

const STORAGE_KEY = 'devflow_projects';

export class ProjectStorage {
  // Obtener la clave de storage específica para el usuario
  private static getUserStorageKey(userId?: string): string {
    if (!userId) return STORAGE_KEY; // Fallback para compatibilidad
    return `${STORAGE_KEY}_user_${userId}`;
  }

  // Guardar proyectos en localStorage por usuario
  static saveProjects(projects: Project[], userId?: string): void {
    try {
      const projectsData = {
        projects,
        timestamp: new Date().toISOString(),
        version: '1.0',
        userId: userId || 'anonymous'
      };
      const storageKey = this.getUserStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(projectsData));
      console.log(`Proyectos guardados para usuario: ${userId || 'anonymous'}`);
    } catch (error) {
      console.error('Error guardando proyectos:', error);
    }
  }

  // Cargar proyectos desde localStorage por usuario
  static loadProjects(userId?: string): Project[] {
    try {
      const storageKey = this.getUserStorageKey(userId);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        // Si no hay datos para este usuario, retornar array vacío
        // NO migrar proyectos de otros usuarios
        return [];
      }

      const data = JSON.parse(stored);
      
      // Validar estructura de datos
      if (data && data.projects && Array.isArray(data.projects)) {
        const projects = data.projects.map((project: any) => ({
          ...project,
          fechaCreacion: new Date(project.fechaCreacion),
          fechaActualizacion: new Date(project.fechaActualizacion)
        }));
        console.log(`Cargados ${projects.length} proyectos para usuario: ${userId || 'anonymous'}`);
        return projects;
      }
      
      return [];
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      return [];
    }
  }

  // Función de migración eliminada para evitar compartir proyectos entre usuarios

  // Limpiar datos de localStorage corruptos (eliminar datos globales antiguos)
  static clearGlobalProjects(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Datos globales de proyectos eliminados');
    } catch (error) {
      console.error('Error limpiando datos globales:', error);
    }
  }

  // Limpiar proyectos de un usuario específico
  static clearUserProjects(userId: string): void {
    try {
      const storageKey = this.getUserStorageKey(userId);
      localStorage.removeItem(storageKey);
      console.log(`Proyectos eliminados para usuario: ${userId}`);
    } catch (error) {
      console.error('Error limpiando proyectos del usuario:', error);
    }
  }

  // Agregar un nuevo proyecto por usuario
  static addProject(project: Project, userId?: string): void {
    const effectiveUserId = userId || project.userId;
    const projects = this.loadProjects(effectiveUserId);
    projects.push(project);
    this.saveProjects(projects, effectiveUserId);
  }

  // Actualizar un proyecto existente por usuario
  static updateProject(updatedProject: Project, userId?: string): void {
    const effectiveUserId = userId || updatedProject.userId;
    const projects = this.loadProjects(effectiveUserId);
    const index = projects.findIndex(p => p.id === updatedProject.id);
    
    if (index !== -1) {
      projects[index] = { ...updatedProject, fechaActualizacion: new Date() };
      this.saveProjects(projects, effectiveUserId);
    }
  }

  // Eliminar un proyecto por usuario
  static deleteProject(projectId: string, userId?: string): void {
    // Buscar en qué usuario está el proyecto si no se especifica
    if (!userId) {
      // Intentar encontrar el proyecto en cualquier usuario
      const project = this.getProject(projectId);
      if (project && project.userId) {
        userId = project.userId;
      }
    }
    
    const projects = this.loadProjects(userId);
    const filteredProjects = projects.filter(p => p.id !== projectId);
    this.saveProjects(filteredProjects, userId);
  }

  // Obtener un proyecto por ID (busca en todos los usuarios si es necesario)
  static getProject(projectId: string, userId?: string): Project | null {
    if (userId) {
      const projects = this.loadProjects(userId);
      return projects.find(p => p.id === projectId) || null;
    }
    
    // Si no se especifica usuario, buscar en localStorage general
    try {
      // Buscar en todas las claves de usuario posibles
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = JSON.parse(stored);
            if (data.projects) {
              const project = data.projects.find((p: any) => p.id === projectId);
              if (project) {
                return {
                  ...project,
                  fechaCreacion: new Date(project.fechaCreacion),
                  fechaActualizacion: new Date(project.fechaActualizacion)
                };
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error buscando proyecto:', error);
    }
    
    return null;
  }

  // Limpiar todos los proyectos
  static clearProjects(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Exportar proyectos a JSON
  static exportProjects(): string {
    const projects = this.loadProjects();
    return JSON.stringify({
      projects,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Importar proyectos desde JSON
  static importProjects(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data && data.projects && Array.isArray(data.projects)) {
        const projects = data.projects.map((project: any) => ({
          ...project,
          fechaCreacion: new Date(project.fechaCreacion),
          fechaActualizacion: new Date(project.fechaActualizacion)
        }));
        
        this.saveProjects(projects);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importando proyectos:', error);
      return false;
    }
  }

  // Obtener estadísticas de proyectos por usuario
  static getProjectStats(userId?: string) {
    const projects = this.loadProjects(userId);
    
    const stats = {
      total: projects.length,
      activos: projects.filter(p => p.estado === 'activo').length,
      completados: projects.filter(p => p.estado === 'completado').length,
      pausados: projects.filter(p => p.estado === 'pausado').length,
      porTipo: {} as Record<string, number>,
      porPrioridad: {} as Record<string, number>
    };

    // Contar por tipo
    projects.forEach(project => {
      stats.porTipo[project.tipo] = (stats.porTipo[project.tipo] || 0) + 1;
    });

    // Contar por prioridad
    projects.forEach(project => {
      stats.porPrioridad[project.prioridad] = (stats.porPrioridad[project.prioridad] || 0) + 1;
    });

    return stats;
  }
}
