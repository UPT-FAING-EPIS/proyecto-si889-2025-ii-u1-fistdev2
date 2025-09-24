import { CreateProjectDto, UpdateProjectDto, ProjectResponse } from '../../dominio/project.dto';
import { PrismaService } from '../../común/prisma.service';
import { LoggerService } from '../../común/logger.service';
export declare class ProjectService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectResponse>;
    findAll(userId: string): Promise<ProjectResponse[]>;
    findOne(id: string, userId: string): Promise<ProjectResponse>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<ProjectResponse>;
    remove(id: string, userId: string): Promise<boolean>;
    getStatistics(userId: string): Promise<{
        total: number;
        activos: number;
        completados: number;
        pausados: number;
        planificacion: number;
        progresoPromedio: number;
    }>;
    private mapProjectToResponse;
    private validateAndMapProjectType;
    private validateAndMapPriority;
    private validateAndMapStatus;
    private mapTypeToResponse;
    private mapStatusToResponse;
    private mapPriorityToResponse;
}
