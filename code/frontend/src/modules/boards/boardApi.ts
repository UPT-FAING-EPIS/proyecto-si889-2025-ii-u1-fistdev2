import { apiRequest } from '../auth/axiosConfig';

// ==================== INTERFACES ====================

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
  };
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  position: number;
  status: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  color: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invitedBy: string;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'moved' | 'assigned' | 'commented' | 'completed';
  details: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ==================== API RESPONSES ====================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ==================== BOARD API ====================

export const boardApi = {
  // Obtener tablero por proyecto
  async getBoardByProject(projectId: string): Promise<Board> {
    const response = await apiRequest.get<ApiResponse<Board>>(`/boards/project/${projectId}`);
    return response.data;
  },

  // Crear nuevo tablero
  async createBoard(projectId: string, boardData: Partial<Board>): Promise<Board> {
    const response = await apiRequest.post<ApiResponse<Board>>(`/boards`, { ...boardData, projectId });
    return response.data;
  },

  // Actualizar tablero
  async updateBoard(boardId: string, updates: Partial<Board>): Promise<Board> {
    const response = await apiRequest.patch<ApiResponse<Board>>(`/boards/${boardId}`, updates);
    return response.data;
  },
};

// ==================== TASKS API ====================

export const taskApi = {
  // Crear nueva tarea
  async createTask(columnId: string, taskData: Partial<Task>): Promise<Task> {
    const response = await apiRequest.post<ApiResponse<Task>>(`/boards/columns/${columnId}/tasks`, taskData);
    return response.data;
  },

  // Obtener tarea por ID
  async getTask(taskId: string): Promise<Task> {
    const response = await apiRequest.get<ApiResponse<Task>>(`/boards/tasks/${taskId}`);
    return response.data;
  },

  // Actualizar tarea
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await apiRequest.put<ApiResponse<Task>>(`/boards/tasks/${taskId}`, updates);
    return response.data;
  },

  // Mover tarea entre columnas
  async moveTask(taskId: string, targetColumnId: string, position: number): Promise<Task> {
    const response = await apiRequest.put<ApiResponse<Task>>(`/boards/tasks/${taskId}/move`, {
      targetColumnId,
      position
    });
    return response.data;
  },

  // Asignar tarea a usuario
  async assignTask(taskId: string, assignedTo: string): Promise<Task> {
    const response = await apiRequest.put<ApiResponse<Task>>(`/boards/tasks/${taskId}/assign`, {
      assignedTo
    });
    return response.data;
  },

  // Eliminar tarea
  async deleteTask(taskId: string): Promise<void> {
    await apiRequest.delete(`/boards/tasks/${taskId}`);
  },
};

// ==================== PROJECT MEMBERS API ====================

export const membersApi = {
  // Obtener miembros del proyecto - usando el endpoint correcto del backend
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      // Usar el endpoint del MembershipController que es el correcto
      const response = await apiRequest.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
      return response.data;
    } catch (error: any) {
      // Fallback al endpoint del BoardController si el principal falla
      if (error.response?.status === 404) {
        const response = await apiRequest.get<ApiResponse<ProjectMember[]>>(`/boards/project/${projectId}/members`);
        return response.data;
      }
      throw error;
    }
  },

  // Invitar miembros al proyecto - usando el endpoint correcto
  async inviteToProject(projectId: string, emails: string[], role: string = 'MEMBER'): Promise<any> {
    const response = await apiRequest.post<ApiResponse<any>>(`/projects/${projectId}/invite`, {
      emails,
      role
    });
    return response.data;
  },

  // Agregar miembro al proyecto - mantener para compatibilidad
  async addProjectMember(projectId: string, userId: string, role: string = 'member'): Promise<ProjectMember> {
    const response = await apiRequest.post<ApiResponse<ProjectMember>>(`/boards/project/${projectId}/members`, {
      userId,
      role
    });
    return response.data;
  },

  // Actualizar rol de miembro
  async updateMemberRole(projectId: string, userId: string, role: string): Promise<ProjectMember> {
    const response = await apiRequest.put<ApiResponse<ProjectMember>>(`/boards/project/${projectId}/members/${userId}/role`, {
      role
    });
    return response.data;
  },

  // Remover miembro del proyecto - usando el endpoint correcto
  async removeMember(projectId: string, memberId: string): Promise<void> {
    await apiRequest.delete(`/projects/${projectId}/members/${memberId}`);
  },

  // Verificar membresía en proyecto
  async checkMembership(projectId: string): Promise<any> {
    const response = await apiRequest.get<ApiResponse<any>>(`/projects/${projectId}/check-membership`);
    return response.data;
  },

  // Obtener proyectos del usuario
  async getUserProjects(): Promise<any[]> {
    const response = await apiRequest.get<ApiResponse<any[]>>(`/membership/my-projects`);
    return response.data;
  },

  // Aceptar invitación a proyecto
  async acceptInvitation(token: string): Promise<any> {
    const response = await apiRequest.post<ApiResponse<any>>(`/membership/invitations/${token}/accept`);
    return response.data;
  },
};

// ==================== COMMENTS API ====================

export const commentsApi = {
  // Obtener comentarios de tarea
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const response = await apiRequest.get<ApiResponse<TaskComment[]>>(`/boards/tasks/${taskId}/comments`);
    return response.data;
  },

  // Agregar comentario a tarea
  async addTaskComment(taskId: string, content: string): Promise<TaskComment> {
    const response = await apiRequest.post<ApiResponse<TaskComment>>(`/boards/tasks/${taskId}/comments`, {
      content
    });
    return response.data;
  },
};

// ==================== ACTIVITY API ====================

export const activityApi = {
  // Obtener actividad de tarea
  async getTaskActivity(taskId: string): Promise<TaskActivity[]> {
    const response = await apiRequest.get<ApiResponse<TaskActivity[]>>(`/boards/tasks/${taskId}/activity`);
    return response.data;
  },

  // Obtener actividad de tablero
  async getBoardActivity(boardId: string, limit: number = 50): Promise<TaskActivity[]> {
    const response = await apiRequest.get<ApiResponse<TaskActivity[]>>(`/boards/${boardId}/activity?limit=${limit}`);
    return response.data;
  },
};

// ==================== UTILITY FUNCTIONS ====================

export const getColumnColor = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    blue: 'border-blue-200 bg-blue-50',
    orange: 'border-orange-200 bg-orange-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
    gray: 'border-gray-200 bg-gray-50',
  };
  return colorMap[color] || colorMap.gray;
};

export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  const priorityMap = {
    high: 'border-red-200 bg-red-50 text-red-700',
    medium: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    low: 'border-green-200 bg-green-50 text-green-700',
  };
  return priorityMap[priority];
};

export const getPriorityIcon = (priority: 'low' | 'medium' | 'high'): string => {
  const iconMap = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };
  return iconMap[priority];
};