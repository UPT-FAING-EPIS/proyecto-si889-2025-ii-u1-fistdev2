import { BoardService } from './board.service';
import { Board, Column, Task, ProjectMember } from '../../dominio/entidades/board';
export declare class BoardController {
    private readonly boardService;
    constructor(boardService: BoardService);
    getTest(): {
        message: string;
        timestamp: string;
        version: string;
        status: string;
    };
    getBoardByProject(projectId: string): Promise<{
        success: boolean;
        data: Board;
    }>;
    createBoard(projectId: string, createBoardDto: {
        name: string;
        description?: string;
    }): Promise<{
        success: boolean;
        data: Board;
    }>;
    createColumn(boardId: string, createColumnDto: {
        title: string;
        position: number;
        color?: string;
    }): Promise<{
        success: boolean;
        data: Column;
    }>;
    getTask(taskId: string): Promise<{
        success: boolean;
        data: Task;
    }>;
    createTask(columnId: string, createTaskDto: {
        title: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        assignedTo?: string;
    }): Promise<{
        success: boolean;
        data: Task;
    }>;
    moveTask(taskId: string, moveTaskDto: {
        targetColumnId: string;
        position: number;
    }): Promise<{
        success: boolean;
        data: Task;
    }>;
    getProjectMembers(projectId: string): Promise<{
        success: boolean;
        data: ProjectMember[];
    }>;
    addProjectMember(projectId: string, addMemberDto: {
        userId: string;
        role: 'owner' | 'admin' | 'member' | 'viewer';
        invitedBy?: string;
    }): Promise<{
        success: boolean;
        data: ProjectMember;
    }>;
}
