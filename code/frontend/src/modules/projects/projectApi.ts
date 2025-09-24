import { Project } from './project';
import { TokenService } from '../auth/tokenService';
import { apiRequest } from '../auth/axiosConfig';

export interface CreateProjectRequest {
  name: string;
  descripcion?: string;
  tipo: 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack';
  prioridad?: 'baja' | 'media' | 'alta' | 'critica';
  presupuesto?: number;
  cliente?: string;
  tecnologias?: string[];
  equipo?: string[];
  repositorio?: string;
  notas?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ProjectApiService {

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      console.log('🔨 Creando proyecto...');
      
      const response = await apiRequest.post<ApiResponse<Project>>(
        '/api/v1/projects',
        projectData
      );

      if (response.success && response.data) {
        console.log('✅ Proyecto creado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear proyecto');
      }
    } catch (error: any) {
      console.error('❌ Error creando proyecto:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión al crear proyecto');
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      console.log('📋 Obteniendo proyectos...');
      
      const response = await apiRequest.get<ApiResponse<Project[]>>('/api/v1/projects');

      if (response.success && response.data) {
        console.log(`✅ ${response.data.length} proyectos obtenidos`);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener proyectos');
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo proyectos:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión al obtener proyectos');
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      console.log(`📄 Obteniendo proyecto ${id}...`);
      
      const response = await apiRequest.get<ApiResponse<Project>>(`/api/v1/projects/${id}`);

      if (response.success && response.data) {
        console.log('✅ Proyecto obtenido exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener proyecto');
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo proyecto:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión al obtener proyecto');
    }
  }

  async updateProject(id: string, updateData: Partial<CreateProjectRequest>): Promise<Project> {
    try {
      console.log(`✏️ Actualizando proyecto ${id}...`);
      
      const response = await apiRequest.put<ApiResponse<Project>>(
        `/api/v1/projects/${id}`,
        updateData
      );

      if (response.success && response.data) {
        console.log('✅ Proyecto actualizado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar proyecto');
      }
    } catch (error: any) {
      console.error('❌ Error actualizando proyecto:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión al actualizar proyecto');
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      console.log(`🗑️ Eliminando proyecto ${id}...`);
      
      const response = await apiRequest.delete<ApiResponse<void>>(`/api/v1/projects/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar proyecto');
      }
      
      console.log('✅ Proyecto eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ Error eliminando proyecto:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión al eliminar proyecto');
    }
  }

  async getStatistics(): Promise<any> {
    try {
      console.log('📊 Obteniendo estadísticas de proyectos...');
      
      const response = await apiRequest.get('/projects/statistics');

      if (response.success && response.data) {
        console.log('✅ Estadísticas obtenidas exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener estadísticas');
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error de conexión al obtener estadísticas');
    }
  }
}

export const projectApiService = new ProjectApiService();
