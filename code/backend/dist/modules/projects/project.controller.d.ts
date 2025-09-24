import { ProjectService } from './project.service';
import { BoardService } from '../boards/board.service';
import { CreateProjectDto, UpdateProjectDto } from '../../dominio/project.dto';
export declare class ProjectController {
    private readonly projectService;
    private readonly boardService;
    constructor(projectService: ProjectService, boardService: BoardService);
    create(createProjectDto: CreateProjectDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../../dominio/project.dto").ProjectResponse;
    }>;
    findAll(req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../../dominio/project.dto").ProjectResponse[];
    }>;
    getStatistics(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            total: number;
            activos: number;
            completados: number;
            pausados: number;
            planificacion: number;
            progresoPromedio: number;
        };
    }>;
    boardTest(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            boardCreated: boolean;
            boardId: string;
            boardName: string;
            columnsCount: number;
            projectId: string;
        };
        timestamp: string;
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../../dominio/project.dto").ProjectResponse;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../../dominio/project.dto").ProjectResponse;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
