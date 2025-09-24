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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const board_service_1 = require("../boards/board.service");
const project_dto_1 = require("../../dominio/project.dto");
const jwt_auth_guard_1 = require("../../com\u00FAn/guards/jwt-auth.guard");
let ProjectController = class ProjectController {
    constructor(projectService, boardService) {
        this.projectService = projectService;
        this.boardService = boardService;
    }
    async create(createProjectDto, req) {
        try {
            const userId = req.user.userId;
            const project = await this.projectService.create(createProjectDto, userId);
            return {
                success: true,
                message: 'Proyecto creado exitosamente',
                data: project
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Error al crear el proyecto',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(req) {
        try {
            if (!req.user || !req.user.userId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Usuario no autenticado'
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const userId = req.user.userId;
            const userRole = req.user.role;
            const projects = await this.projectService.findAll(userId);
            return {
                success: true,
                message: 'Proyectos obtenidos exitosamente',
                data: projects
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Error al obtener proyectos',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStatistics(req) {
        try {
            const userId = req.user.userId;
            const statistics = await this.projectService.getStatistics(userId);
            return {
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: statistics
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async boardTest(req) {
        try {
            const testBoard = await this.boardService.createBoard({
                projectId: 'test-project-' + Date.now(),
                name: 'Tablero de Prueba',
                description: 'Tablero creado para probar la funcionalidad',
                createdBy: req.user.userId || 'test-user'
            });
            return {
                success: true,
                message: 'BoardService funcionando correctamente desde ProjectController',
                data: {
                    boardCreated: true,
                    boardId: testBoard.id,
                    boardName: testBoard.name,
                    columnsCount: testBoard.columns?.length || 0,
                    projectId: testBoard.projectId
                },
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Error probando BoardService: ${error.message}`,
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id, req) {
        try {
            const userId = req.user.userId;
            const project = await this.projectService.findOne(id, userId);
            return {
                success: true,
                message: 'Proyecto obtenido exitosamente',
                data: project
            };
        }
        catch (error) {
            if (error.message === 'Proyecto no encontrado') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Proyecto no encontrado o acceso denegado'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Error al obtener el proyecto',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateProjectDto, req) {
        try {
            const userId = req.user.userId;
            const project = await this.projectService.update(id, updateProjectDto, userId);
            return {
                success: true,
                message: 'Proyecto actualizado exitosamente',
                data: project
            };
        }
        catch (error) {
            if (error.message.includes('no encontrado') || error.message.includes('sin permisos')) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Proyecto no encontrado o acceso denegado'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Error al actualizar el proyecto',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id, req) {
        try {
            const userId = req.user.userId;
            const deleted = await this.projectService.remove(id, userId);
            if (!deleted) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Proyecto no encontrado o acceso denegado'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                message: 'Proyecto eliminado exitosamente'
            };
        }
        catch (error) {
            if (error.message.includes('no encontrado') || error.message.includes('sin permisos')) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Proyecto no encontrado o acceso denegado'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Error al eliminar el proyecto',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('board-test'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "boardTest", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "remove", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [project_service_1.ProjectService,
        board_service_1.BoardService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map