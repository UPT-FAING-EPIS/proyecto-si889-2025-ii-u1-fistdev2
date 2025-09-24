"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardRepositoryService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const fs = require("fs/promises");
const path = require("path");
let BoardRepositoryService = class BoardRepositoryService {
    constructor() {
        this.dataPath = path.join(process.cwd(), 'data');
        this.boardsFile = path.join(this.dataPath, 'boards.json');
        this.columnsFile = path.join(this.dataPath, 'columns.json');
        this.tasksFile = path.join(this.dataPath, 'tasks.json');
        this.membersFile = path.join(this.dataPath, 'project-members.json');
        this.commentsFile = path.join(this.dataPath, 'task-comments.json');
        this.activitiesFile = path.join(this.dataPath, 'task-activities.json');
        this.initializeStorage();
    }
    async initializeStorage() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            await this.ensureFileExists(this.boardsFile, []);
            await this.ensureFileExists(this.columnsFile, []);
            await this.ensureFileExists(this.tasksFile, []);
            await this.ensureFileExists(this.membersFile, []);
            await this.ensureFileExists(this.commentsFile, []);
            await this.ensureFileExists(this.activitiesFile, []);
        }
        catch (error) {
            console.error('Error inicializando almacenamiento de tableros:', error);
        }
    }
    async ensureFileExists(filePath, defaultData) {
        try {
            await fs.access(filePath);
        }
        catch {
            await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        }
    }
    async readJsonFile(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`Error leyendo ${filePath}:`, error);
            return [];
        }
    }
    async writeJsonFile(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error(`Error escribiendo ${filePath}:`, error);
            throw error;
        }
    }
    async createBoard(boardData) {
        const boards = await this.readJsonFile(this.boardsFile);
        const newBoard = {
            id: (0, uuid_1.v4)(),
            projectId: boardData.projectId,
            name: boardData.name,
            description: boardData.description || '',
            columns: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: boardData.createdBy
        };
        boards.push(newBoard);
        await this.writeJsonFile(this.boardsFile, boards);
        await this.createDefaultColumns(newBoard.id);
        return await this.getBoardById(newBoard.id) || newBoard;
    }
    async createDefaultColumns(boardId) {
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
    async getBoardById(boardId) {
        const boards = await this.readJsonFile(this.boardsFile);
        const board = boards.find(b => b.id === boardId);
        if (!board)
            return null;
        const columns = await this.readJsonFile(this.columnsFile);
        board.columns = columns.filter(c => c.boardId === boardId).sort((a, b) => a.position - b.position);
        const tasks = await this.readJsonFile(this.tasksFile);
        for (const column of board.columns) {
            column.tasks = tasks
                .filter(t => t.columnId === column.id)
                .sort((a, b) => a.position - b.position);
        }
        return board;
    }
    async getBoardByProjectId(projectId) {
        const boards = await this.readJsonFile(this.boardsFile);
        const board = boards.find(b => b.projectId === projectId);
        if (!board)
            return null;
        return await this.getBoardById(board.id);
    }
    async updateBoard(boardId, updates) {
        const boards = await this.readJsonFile(this.boardsFile);
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
    async deleteBoard(boardId) {
        const boards = await this.readJsonFile(this.boardsFile);
        const filteredBoards = boards.filter(b => b.id !== boardId);
        const columns = await this.readJsonFile(this.columnsFile);
        const filteredColumns = columns.filter(c => c.boardId !== boardId);
        const tasks = await this.readJsonFile(this.tasksFile);
        const columnIds = columns.filter(c => c.boardId === boardId).map(c => c.id);
        const filteredTasks = tasks.filter(t => !columnIds.includes(t.columnId));
        await Promise.all([
            this.writeJsonFile(this.boardsFile, filteredBoards),
            this.writeJsonFile(this.columnsFile, filteredColumns),
            this.writeJsonFile(this.tasksFile, filteredTasks)
        ]);
    }
    async createColumn(columnData) {
        const columns = await this.readJsonFile(this.columnsFile);
        const newColumn = {
            id: (0, uuid_1.v4)(),
            boardId: columnData.boardId,
            title: columnData.title,
            position: columnData.position,
            color: columnData.color || 'blue',
            tasks: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        columns.push(newColumn);
        await this.writeJsonFile(this.columnsFile, columns);
        return newColumn;
    }
    async updateColumn(columnId, updates) {
        const columns = await this.readJsonFile(this.columnsFile);
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
    async deleteColumn(columnId) {
        const columns = await this.readJsonFile(this.columnsFile);
        const filteredColumns = columns.filter(c => c.id !== columnId);
        const tasks = await this.readJsonFile(this.tasksFile);
        const filteredTasks = tasks.filter(t => t.columnId !== columnId);
        await Promise.all([
            this.writeJsonFile(this.columnsFile, filteredColumns),
            this.writeJsonFile(this.tasksFile, filteredTasks)
        ]);
    }
    async reorderColumns(boardId, columnOrders) {
        const columns = await this.readJsonFile(this.columnsFile);
        for (const order of columnOrders) {
            const columnIndex = columns.findIndex(c => c.id === order.id && c.boardId === boardId);
            if (columnIndex !== -1) {
                columns[columnIndex].position = order.position;
                columns[columnIndex].updatedAt = new Date();
            }
        }
        await this.writeJsonFile(this.columnsFile, columns);
    }
    async createTask(taskData) {
        const tasks = await this.readJsonFile(this.tasksFile);
        const newTask = {
            id: (0, uuid_1.v4)(),
            columnId: taskData.columnId,
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            assignedTo: taskData.assignedTo,
            estimatedHours: taskData.estimatedHours || 1,
            actualHours: 0,
            tags: taskData.tags || [],
            position: taskData.position || 0,
            status: taskData.columnId,
            dueDate: taskData.dueDate,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: taskData.createdBy,
            lastModifiedBy: taskData.createdBy
        };
        tasks.push(newTask);
        await this.writeJsonFile(this.tasksFile, tasks);
        await this.logTaskActivityInternal(newTask.id, taskData.createdBy, 'created', 'Tarea creada');
        return newTask;
    }
    async getTask(taskId) {
        const tasks = await this.readJsonFile(this.tasksFile);
        return tasks.find(t => t.id === taskId) || null;
    }
    async updateTask(taskId, updates) {
        const tasks = await this.readJsonFile(this.tasksFile);
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
        if (updates.title && updates.title !== oldTask.title) {
            await this.logTaskActivityInternal(taskId, updates.lastModifiedBy, 'updated', `Título cambiado de "${oldTask.title}" a "${updates.title}"`);
        }
        return tasks[taskIndex];
    }
    async moveTask(taskId, targetColumnId, position) {
        const tasks = await this.readJsonFile(this.tasksFile);
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
        if (oldColumnId !== targetColumnId) {
            await this.logTaskActivityInternal(taskId, tasks[taskIndex].lastModifiedBy, 'moved', `Tarea movida entre columnas`);
        }
        return tasks[taskIndex];
    }
    async deleteTask(taskId) {
        const tasks = await this.readJsonFile(this.tasksFile);
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        const comments = await this.readJsonFile(this.commentsFile);
        const filteredComments = comments.filter(c => c.taskId !== taskId);
        const activities = await this.readJsonFile(this.activitiesFile);
        const filteredActivities = activities.filter(a => a.taskId !== taskId);
        await Promise.all([
            this.writeJsonFile(this.tasksFile, filteredTasks),
            this.writeJsonFile(this.commentsFile, filteredComments),
            this.writeJsonFile(this.activitiesFile, filteredActivities)
        ]);
    }
    async assignTask(taskId, assignedTo) {
        return await this.updateTask(taskId, { assignedTo, lastModifiedBy: assignedTo });
    }
    async addProjectMember(memberData) {
        const members = await this.readJsonFile(this.membersFile);
        let validatedRole = memberData.role || 'member';
        if (validatedRole === 'owner') {
            validatedRole = 'member';
        }
        const newMember = {
            id: (0, uuid_1.v4)(),
            projectId: memberData.projectId,
            userId: memberData.userId,
            role: validatedRole,
            invitedBy: memberData.invitedBy,
            joinedAt: new Date()
        };
        members.push(newMember);
        await this.writeJsonFile(this.membersFile, members);
        return newMember;
    }
    async getProjectMembers(projectId) {
        const members = await this.readJsonFile(this.membersFile);
        return members.filter(m => m.projectId === projectId);
    }
    async updateMemberRole(projectId, userId, role) {
        const members = await this.readJsonFile(this.membersFile);
        const memberIndex = members.findIndex(m => m.projectId === projectId && m.userId === userId);
        if (memberIndex === -1) {
            throw new Error('Miembro no encontrado');
        }
        members[memberIndex].role = role;
        await this.writeJsonFile(this.membersFile, members);
        return members[memberIndex];
    }
    async removeMemberFromProject(projectId, userId) {
        const members = await this.readJsonFile(this.membersFile);
        const filteredMembers = members.filter(m => !(m.projectId === projectId && m.userId === userId));
        await this.writeJsonFile(this.membersFile, filteredMembers);
    }
    async checkMemberPermission(projectId, userId, requiredRole) {
        const members = await this.readJsonFile(this.membersFile);
        const member = members.find(m => m.projectId === projectId && m.userId === userId);
        if (!member)
            return false;
        if (!requiredRole)
            return true;
        const roleHierarchy = { 'viewer': 0, 'member': 1, 'admin': 2, 'owner': 3 };
        const userLevel = roleHierarchy[member.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        return userLevel >= requiredLevel;
    }
    async addTaskComment(commentData) {
        const comments = await this.readJsonFile(this.commentsFile);
        const newComment = {
            id: (0, uuid_1.v4)(),
            taskId: commentData.taskId,
            userId: commentData.userId,
            content: commentData.content,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        comments.push(newComment);
        await this.writeJsonFile(this.commentsFile, comments);
        await this.logTaskActivityInternal(commentData.taskId, commentData.userId, 'commented', 'Comentario añadido');
        return newComment;
    }
    async getTaskComments(taskId) {
        const comments = await this.readJsonFile(this.commentsFile);
        return comments.filter(c => c.taskId === taskId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async updateTaskComment(commentId, content, userId) {
        const comments = await this.readJsonFile(this.commentsFile);
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
    async deleteTaskComment(commentId, userId) {
        const comments = await this.readJsonFile(this.commentsFile);
        const filteredComments = comments.filter(c => c.id !== commentId);
        await this.writeJsonFile(this.commentsFile, filteredComments);
    }
    async logTaskActivity(activityData) {
        const activities = await this.readJsonFile(this.activitiesFile);
        const newActivity = {
            id: (0, uuid_1.v4)(),
            taskId: activityData.taskId,
            userId: activityData.userId,
            action: activityData.action,
            details: activityData.details,
            oldValue: activityData.oldValue,
            newValue: activityData.newValue,
            createdAt: new Date()
        };
        activities.push(newActivity);
        await this.writeJsonFile(this.activitiesFile, activities);
        return newActivity;
    }
    async logTaskActivityInternal(taskId, userId, action, details, oldValue, newValue) {
        await this.logTaskActivity({
            taskId,
            userId,
            action,
            details,
            oldValue,
            newValue
        });
    }
    async getTaskActivity(taskId) {
        const activities = await this.readJsonFile(this.activitiesFile);
        return activities.filter(a => a.taskId === taskId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getBoardActivity(boardId) {
        const activities = await this.readJsonFile(this.activitiesFile);
        const columns = await this.readJsonFile(this.columnsFile);
        const tasks = await this.readJsonFile(this.tasksFile);
        const boardColumns = columns.filter(col => col.boardId === boardId);
        const columnIds = boardColumns.map(col => col.id);
        const boardTasks = tasks.filter(task => columnIds.includes(task.columnId));
        const taskIds = boardTasks.map(task => task.id);
        return activities
            .filter(activity => taskIds.includes(activity.taskId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async searchTasks(query, projectIds, filters) {
        const tasks = await this.readJsonFile(this.tasksFile);
        return tasks.filter(task => {
            if (projectIds && projectIds.length > 0) {
            }
            const searchFields = [task.title, task.description, ...(task.tags || [])];
            const matchesQuery = query ? searchFields.some(field => field.toLowerCase().includes(query.toLowerCase())) : true;
            return matchesQuery;
        });
    }
};
exports.BoardRepositoryService = BoardRepositoryService;
exports.BoardRepositoryService = BoardRepositoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BoardRepositoryService);
//# sourceMappingURL=board-repository.service.js.map