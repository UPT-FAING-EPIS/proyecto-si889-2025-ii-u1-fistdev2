import { IBoardService } from '../../dominio/interfaces/board.interface';
import { Board, Column, Task, ProjectMember, TaskComment, TaskActivity } from '../../dominio/entidades/board';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';
import { MembershipService } from '../membership/membership.service';
import { LoggerService } from '../../común/logger.service';
import { PrismaService } from '../../común/prisma.service';
export declare class BoardService implements IBoardService {
    private readonly collaborationGateway;
    private readonly membershipService;
    private readonly logger;
    private readonly prisma;
    constructor(collaborationGateway: CollaborationGateway, membershipService: MembershipService, logger: LoggerService, prisma: PrismaService);
    private validateProjectMembership;
    private emitBoardEvent;
    private mapBoardToResponse;
    createBoard(boardData: Partial<Board>): Promise<Board>;
    getBoardByProjectId(projectId: string): Promise<Board | null>;
    updateBoard(boardId: string, updates: Partial<Board>): Promise<Board>;
    deleteBoard(boardId: string): Promise<void>;
    createColumn(columnData: Partial<Column>): Promise<Column>;
    updateColumn(columnId: string, updates: Partial<Column>): Promise<Column>;
    deleteColumn(columnId: string): Promise<void>;
    reorderColumns(boardId: string, columnOrders: {
        id: string;
        position: number;
    }[]): Promise<void>;
    createTask(taskData: Partial<Task>, actorInfo?: {
        id: string;
        email: string;
        name: string;
    }): Promise<Task>;
    getTask(taskId: string): Promise<Task | null>;
    updateTask(taskId: string, updates: Partial<Task>, actorInfo?: {
        id: string;
        email: string;
        name: string;
    }): Promise<Task>;
    deleteTask(taskId: string): Promise<void>;
    moveTask(taskId: string, targetColumnId: string, position: number, actorInfo?: {
        id: string;
        email: string;
        name: string;
    }): Promise<Task>;
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
    private createDefaultColumns;
}
