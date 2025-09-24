import { Board, Column, Task, ProjectMember, TaskComment, TaskActivity } from '../entidades/board';
export interface IBoardService {
    createBoard(boardData: Partial<Board>): Promise<Board>;
    getBoardByProjectId(projectId: string): Promise<Board | null>;
    updateBoard(boardId: string, updates: Partial<Board>): Promise<Board>;
    deleteBoard(boardId: string): Promise<void>;
    createColumn(columnData: Partial<Column>): Promise<Column>;
    updateColumn(columnId: string, updates: Partial<Column>): Promise<Column>;
    reorderColumns(boardId: string, columnOrders: {
        id: string;
        position: number;
    }[]): Promise<void>;
    deleteColumn(columnId: string): Promise<void>;
    createTask(taskData: Partial<Task>): Promise<Task>;
    getTask(taskId: string): Promise<Task | null>;
    updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
    moveTask(taskId: string, targetColumnId: string, position: number): Promise<Task>;
    deleteTask(taskId: string): Promise<void>;
    assignTask(taskId: string, assignedTo: string): Promise<Task>;
    addProjectMember(memberData: Partial<ProjectMember>): Promise<ProjectMember>;
    getProjectMembers(projectId: string): Promise<ProjectMember[]>;
    updateMemberRole(projectId: string, userId: string, role: ProjectMember['role']): Promise<ProjectMember>;
    removeMemberFromProject(projectId: string, userId: string): Promise<void>;
    checkMemberPermission(projectId: string, userId: string, requiredRole?: string): Promise<boolean>;
    addTaskComment(commentData: Partial<TaskComment>): Promise<TaskComment>;
    getTaskComments(taskId: string): Promise<TaskComment[]>;
    updateTaskComment(commentId: string, content: string, userId: string): Promise<TaskComment>;
    deleteTaskComment(commentId: string, userId: string): Promise<void>;
    logTaskActivity(activityData: Partial<TaskActivity>): Promise<TaskActivity>;
    getTaskActivity(taskId: string): Promise<TaskActivity[]>;
    getBoardActivity(boardId: string, limit?: number): Promise<TaskActivity[]>;
}
export interface INotificationService {
    notifyBoardUpdate(boardId: string, action: string, data: any, excludeUserId?: string): Promise<void>;
    notifyTaskUpdate(taskId: string, action: string, data: any, excludeUserId?: string): Promise<void>;
    notifyMemberAdded(projectId: string, newMemberData: ProjectMember): Promise<void>;
}
