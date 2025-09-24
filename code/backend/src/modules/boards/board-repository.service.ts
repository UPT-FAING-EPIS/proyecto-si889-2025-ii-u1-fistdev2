import { Injectable } from '@nestjs/common';
import { IBoardService } from '../../dominio/interfaces/board.interface';
import { Board, Column, Task, ProjectMember, TaskComment, TaskActivity } from '../../dominio/entidades/board';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class BoardRepositoryService implements IBoardService {
  private readonly dataPath = path.join(process.cwd(), 'data');
  private readonly boardsFile = path.join(this.dataPath, 'boards.json');
  private readonly columnsFile = path.join(this.dataPath, 'columns.json');
  private readonly tasksFile = path.join(this.dataPath, 'tasks.json');
  private readonly membersFile = path.join(this.dataPath, 'project-members.json');
  private readonly commentsFile = path.join(this.dataPath, 'task-comments.json');
  private readonly activitiesFile = path.join(this.dataPath, 'task-activities.json');

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.dataPath, { recursive: true });
      
      // Inicializar archivos si no existen
      await this.ensureFileExists(this.boardsFile, []);
      await this.ensureFileExists(this.columnsFile, []);
      await this.ensureFileExists(this.tasksFile, []);
      await this.ensureFileExists(this.membersFile, []);
      await this.ensureFileExists(this.commentsFile, []);
      await this.ensureFileExists(this.activitiesFile, []);
    } catch (error) {
      console.error('Error inicializando almacenamiento de tableros:', error);
    }
  }

  private async ensureFileExists(filePath: string, defaultData: any[]) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  private async readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error leyendo ${filePath}:`, error);
      return [];
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error escribiendo ${filePath}:`, error);
      throw error;
    }
  }

  // ==================== BOARD OPERATIONS ====================

  async createBoard(boardData: Partial<Board>): Promise<Board> {
    const boards = await this.readJsonFile<Board>(this.boardsFile);
    
    const newBoard: Board = {
      id: uuidv4(),
      projectId: boardData.projectId!,
      name: boardData.name!,
      description: boardData.description || '',
      columns: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: boardData.createdBy!
    };

    boards.push(newBoard);
    await this.writeJsonFile(this.boardsFile, boards);

    // Crear columnas por defecto
    await this.createDefaultColumns(newBoard.id);

    // Recargar el board con las columnas
    return await this.getBoardById(newBoard.id) || newBoard;
  }

  private async createDefaultColumns(boardId: string): Promise<void> {
    const defaultColumnsData = [
      { title: '📋 Product Backlog', position: 0, color: 'blue' },
      { title: '📝 To Do', position: 1, color: 'orange' },
      { title: '🔄 In Progress', position: 2, color: 'yellow' },
      { title: '👀 In Review', position: 3, color: 'purple' },
      { title: '✅ Done', position: 4, color: 'green' }
    ];

    for (const columnData of defaultColumnsData) {
      await this.createColumn({
        boardId,
        title: columnData.title,
        position: columnData.position,
        color: columnData.color,
        tasks: []
      });
    }
  }

  async getBoardById(boardId: string): Promise<Board | null> {
    const boards = await this.readJsonFile<Board>(this.boardsFile);
    const board = boards.find(b => b.id === boardId);
    
    if (!board) return null;

    // Cargar columnas asociadas
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    board.columns = columns.filter(c => c.boardId === boardId).sort((a, b) => a.position - b.position);

    // Cargar tareas para cada columna
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    for (const column of board.columns) {
      column.tasks = tasks
        .filter(t => t.columnId === column.id)
        .sort((a, b) => a.position - b.position);
    }

    return board;
  }

  async getBoardByProjectId(projectId: string): Promise<Board | null> {
    const boards = await this.readJsonFile<Board>(this.boardsFile);
    const board = boards.find(b => b.projectId === projectId);
    
    if (!board) return null;

    return await this.getBoardById(board.id);
  }

  async updateBoard(boardId: string, updates: Partial<Board>): Promise<Board> {
    const boards = await this.readJsonFile<Board>(this.boardsFile);
    const boardIndex = boards.findIndex(b => b.id === boardId);
    
    if (boardIndex === -1) {
      throw new Error('Board no encontrado');
    }

    boards[boardIndex] = {
      ...boards[boardIndex],
      ...updates,
      updatedAt: new Date()
    };

    await this.writeJsonFile(this.boardsFile, boards);
    return boards[boardIndex];
  }

  async deleteBoard(boardId: string): Promise<void> {
    const boards = await this.readJsonFile<Board>(this.boardsFile);
    const filteredBoards = boards.filter(b => b.id !== boardId);
    
    // También eliminar columnas y tareas asociadas
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    const filteredColumns = columns.filter(c => c.boardId !== boardId);
    
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    const columnIds = columns.filter(c => c.boardId === boardId).map(c => c.id);
    const filteredTasks = tasks.filter(t => !columnIds.includes(t.columnId));

    await Promise.all([
      this.writeJsonFile(this.boardsFile, filteredBoards),
      this.writeJsonFile(this.columnsFile, filteredColumns),
      this.writeJsonFile(this.tasksFile, filteredTasks)
    ]);
  }

  // ==================== COLUMN OPERATIONS ====================

  async createColumn(columnData: Partial<Column>): Promise<Column> {
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    
    const newColumn: Column = {
      id: uuidv4(),
      boardId: columnData.boardId!,
      title: columnData.title!,
      position: columnData.position!,
      color: columnData.color || 'blue',
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    columns.push(newColumn);
    await this.writeJsonFile(this.columnsFile, columns);
    return newColumn;
  }

  async updateColumn(columnId: string, updates: Partial<Column>): Promise<Column> {
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    const columnIndex = columns.findIndex(c => c.id === columnId);
    
    if (columnIndex === -1) {
      throw new Error('Columna no encontrada');
    }

    columns[columnIndex] = {
      ...columns[columnIndex],
      ...updates,
      updatedAt: new Date()
    };

    await this.writeJsonFile(this.columnsFile, columns);
    return columns[columnIndex];
  }

  async deleteColumn(columnId: string): Promise<void> {
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    const filteredColumns = columns.filter(c => c.id !== columnId);
    
    // También eliminar tareas de la columna
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    const filteredTasks = tasks.filter(t => t.columnId !== columnId);

    await Promise.all([
      this.writeJsonFile(this.columnsFile, filteredColumns),
      this.writeJsonFile(this.tasksFile, filteredTasks)
    ]);
  }

  async reorderColumns(boardId: string, columnOrders: { id: string; position: number }[]): Promise<void> {
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    
    for (const order of columnOrders) {
      const columnIndex = columns.findIndex(c => c.id === order.id && c.boardId === boardId);
      if (columnIndex !== -1) {
        columns[columnIndex].position = order.position;
        columns[columnIndex].updatedAt = new Date();
      }
    }

    await this.writeJsonFile(this.columnsFile, columns);
  }

  // ==================== TASK OPERATIONS ====================

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    
    const newTask: Task = {
      id: uuidv4(),
      columnId: taskData.columnId!,
      title: taskData.title!,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      assignedTo: taskData.assignedTo,
      estimatedHours: taskData.estimatedHours || 1,
      actualHours: 0,
      tags: taskData.tags || [],
      position: taskData.position || 0,
      status: taskData.columnId!, // Usar columnId como status inicial
      dueDate: taskData.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: taskData.createdBy!,
      lastModifiedBy: taskData.createdBy!
    };

    tasks.push(newTask);
    await this.writeJsonFile(this.tasksFile, tasks);

    // Registrar actividad
    await this.logTaskActivityInternal(newTask.id, taskData.createdBy!, 'created', 'Tarea creada');

    return newTask;
  }

  async getTask(taskId: string): Promise<Task | null> {
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    return tasks.find(t => t.id === taskId) || null;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Tarea no encontrada');
    }

    const oldTask = { ...tasks[taskIndex] };
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
      lastModifiedBy: updates.lastModifiedBy || tasks[taskIndex].lastModifiedBy
    };

    await this.writeJsonFile(this.tasksFile, tasks);

    // Registrar cambios en actividad
    if (updates.title && updates.title !== oldTask.title) {
      await this.logTaskActivityInternal(taskId, updates.lastModifiedBy!, 'updated', `Título cambiado de "${oldTask.title}" a "${updates.title}"`);
    }

    return tasks[taskIndex];
  }

  async moveTask(taskId: string, targetColumnId: string, position: number): Promise<Task> {
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Tarea no encontrada');
    }

    const oldColumnId = tasks[taskIndex].columnId;
    tasks[taskIndex].columnId = targetColumnId;
    tasks[taskIndex].position = position;
    tasks[taskIndex].status = targetColumnId;
    tasks[taskIndex].updatedAt = new Date();

    await this.writeJsonFile(this.tasksFile, tasks);

    // Registrar movimiento
    if (oldColumnId !== targetColumnId) {
      await this.logTaskActivityInternal(taskId, tasks[taskIndex].lastModifiedBy, 'moved', `Tarea movida entre columnas`);
    }

    return tasks[taskIndex];
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    // También eliminar comentarios y actividades
    const comments = await this.readJsonFile<TaskComment>(this.commentsFile);
    const filteredComments = comments.filter(c => c.taskId !== taskId);
    
    const activities = await this.readJsonFile<TaskActivity>(this.activitiesFile);
    const filteredActivities = activities.filter(a => a.taskId !== taskId);

    await Promise.all([
      this.writeJsonFile(this.tasksFile, filteredTasks),
      this.writeJsonFile(this.commentsFile, filteredComments),
      this.writeJsonFile(this.activitiesFile, filteredActivities)
    ]);
  }

  async assignTask(taskId: string, assignedTo: string): Promise<Task> {
    return await this.updateTask(taskId, { assignedTo, lastModifiedBy: assignedTo });
  }

  // ==================== PROJECT MEMBER OPERATIONS ====================

  async addProjectMember(memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    const members = await this.readJsonFile<ProjectMember>(this.membersFile);
    
    // Validar que no se pueda asignar el rol 'owner' a través de este método
    // Solo se permite 'member', 'admin' o 'viewer'
    let validatedRole = memberData.role || 'member';
    if (validatedRole === 'owner') {
      validatedRole = 'member'; // Forzar a 'member' si intentan asignar 'owner'
    }
    
    const newMember: ProjectMember = {
      id: uuidv4(),
      projectId: memberData.projectId!,
      userId: memberData.userId!,
      role: validatedRole,
      invitedBy: memberData.invitedBy!,
      joinedAt: new Date()
    };

    members.push(newMember);
    await this.writeJsonFile(this.membersFile, members);
    return newMember;
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const members = await this.readJsonFile<ProjectMember>(this.membersFile);
    return members.filter(m => m.projectId === projectId);
  }

  async updateMemberRole(projectId: string, userId: string, role: ProjectMember['role']): Promise<ProjectMember> {
    const members = await this.readJsonFile<ProjectMember>(this.membersFile);
    const memberIndex = members.findIndex(m => m.projectId === projectId && m.userId === userId);
    
    if (memberIndex === -1) {
      throw new Error('Miembro no encontrado');
    }

    members[memberIndex].role = role;
    await this.writeJsonFile(this.membersFile, members);
    return members[memberIndex];
  }

  async removeMemberFromProject(projectId: string, userId: string): Promise<void> {
    const members = await this.readJsonFile<ProjectMember>(this.membersFile);
    const filteredMembers = members.filter(m => !(m.projectId === projectId && m.userId === userId));
    await this.writeJsonFile(this.membersFile, filteredMembers);
  }

  async checkMemberPermission(projectId: string, userId: string, requiredRole?: string): Promise<boolean> {
    const members = await this.readJsonFile<ProjectMember>(this.membersFile);
    const member = members.find(m => m.projectId === projectId && m.userId === userId);
    
    if (!member) return false;
    
    if (!requiredRole) return true;
    
    // Jerarquía de roles: owner > admin > member > viewer
    const roleHierarchy = { 'viewer': 0, 'member': 1, 'admin': 2, 'owner': 3 };
    const userLevel = roleHierarchy[member.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  // ==================== TASK COMMENTS ====================

  async addTaskComment(commentData: Partial<TaskComment>): Promise<TaskComment> {
    const comments = await this.readJsonFile<TaskComment>(this.commentsFile);
    
    const newComment: TaskComment = {
      id: uuidv4(),
      taskId: commentData.taskId!,
      userId: commentData.userId!,
      content: commentData.content!,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    comments.push(newComment);
    await this.writeJsonFile(this.commentsFile, comments);

    // Registrar actividad
    await this.logTaskActivityInternal(commentData.taskId!, commentData.userId!, 'commented', 'Comentario añadido');

    return newComment;
  }

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const comments = await this.readJsonFile<TaskComment>(this.commentsFile);
    return comments.filter(c => c.taskId === taskId).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async updateTaskComment(commentId: string, content: string, userId: string): Promise<TaskComment> {
    const comments = await this.readJsonFile<TaskComment>(this.commentsFile);
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      throw new Error('Comentario no encontrado');
    }

    comments[commentIndex] = {
      ...comments[commentIndex],
      content,
      updatedAt: new Date()
    };

    await this.writeJsonFile(this.commentsFile, comments);
    return comments[commentIndex];
  }

  async deleteTaskComment(commentId: string, userId: string): Promise<void> {
    const comments = await this.readJsonFile<TaskComment>(this.commentsFile);
    const filteredComments = comments.filter(c => c.id !== commentId);
    await this.writeJsonFile(this.commentsFile, filteredComments);
  }

  // ==================== TASK ACTIVITY LOG ====================

  async logTaskActivity(activityData: Partial<TaskActivity>): Promise<TaskActivity> {
    const activities = await this.readJsonFile<TaskActivity>(this.activitiesFile);
    
    const newActivity: TaskActivity = {
      id: uuidv4(),
      taskId: activityData.taskId!,
      userId: activityData.userId!,
      action: activityData.action!,
      details: activityData.details!,
      oldValue: activityData.oldValue,
      newValue: activityData.newValue,
      createdAt: new Date()
    };

    activities.push(newActivity);
    await this.writeJsonFile(this.activitiesFile, activities);
    return newActivity;
  }

  private async logTaskActivityInternal(taskId: string, userId: string, action: TaskActivity['action'], details: string, oldValue?: string, newValue?: string): Promise<void> {
    await this.logTaskActivity({
      taskId,
      userId,
      action,
      details,
      oldValue,
      newValue
    });
  }

  async getTaskActivity(taskId: string): Promise<TaskActivity[]> {
    const activities = await this.readJsonFile<TaskActivity>(this.activitiesFile);
    return activities.filter(a => a.taskId === taskId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBoardActivity(boardId: string): Promise<TaskActivity[]> {
    const activities = await this.readJsonFile<TaskActivity>(this.activitiesFile);
    const columns = await this.readJsonFile<Column>(this.columnsFile);
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    
    // Obtener columnas del tablero
    const boardColumns = columns.filter(col => col.boardId === boardId);
    const columnIds = boardColumns.map(col => col.id);
    
    // Obtener tareas de esas columnas
    const boardTasks = tasks.filter(task => columnIds.includes(task.columnId));
    const taskIds = boardTasks.map(task => task.id);
    
    return activities
      .filter(activity => taskIds.includes(activity.taskId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchTasks(query: string, projectIds?: string[], filters?: any): Promise<Task[]> {
    const tasks = await this.readJsonFile<Task>(this.tasksFile);
    
    return tasks.filter(task => {
      // Filtro por proyecto si se especifica
      if (projectIds && projectIds.length > 0) {
        // Necesitamos obtener el projectId a través del board/column
        // Por simplicidad, asumimos que está incluido o se pasa como filtro
      }
      
      // Búsqueda por texto
      const searchFields = [task.title, task.description, ...(task.tags || [])];
      const matchesQuery = query ? searchFields.some(field => 
        field.toLowerCase().includes(query.toLowerCase())
      ) : true;
      
      return matchesQuery;
    });
  }
}