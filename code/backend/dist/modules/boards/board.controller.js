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
exports.BoardController = void 0;
const common_1 = require("@nestjs/common");
const board_service_1 = require("./board.service");
let BoardController = class BoardController {
    constructor(boardService) {
        this.boardService = boardService;
    }
    getTest() {
        try {
            return {
                message: 'Board API funcionando correctamente',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                status: 'OK'
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error en test: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBoardByProject(projectId) {
        try {
            const board = await this.boardService.getBoardByProjectId(projectId);
            return {
                success: true,
                data: board
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error obteniendo tablero: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createBoard(projectId, createBoardDto) {
        try {
            const testUserId = 'test-user-123';
            const board = await this.boardService.createBoard({
                projectId,
                name: createBoardDto.name,
                description: createBoardDto.description || '',
                createdBy: testUserId
            });
            return {
                success: true,
                data: board
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error creando tablero: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createColumn(boardId, createColumnDto) {
        try {
            const column = await this.boardService.createColumn({
                boardId,
                title: createColumnDto.title,
                position: createColumnDto.position,
                color: createColumnDto.color || 'blue',
                tasks: []
            });
            return {
                success: true,
                data: column
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error creando columna: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTask(taskId) {
        try {
            const task = await this.boardService.getTask(taskId);
            return {
                success: true,
                data: task
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error obteniendo tarea: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createTask(columnId, createTaskDto) {
        try {
            const testUserId = 'test-user-123';
            const task = await this.boardService.createTask({
                columnId,
                title: createTaskDto.title,
                description: createTaskDto.description || '',
                priority: createTaskDto.priority || 'medium',
                assignedTo: createTaskDto.assignedTo,
                createdBy: testUserId,
                position: 0
            });
            return {
                success: true,
                data: task
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error creando tarea: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async moveTask(taskId, moveTaskDto) {
        try {
            const result = await this.boardService.moveTask(taskId, moveTaskDto.targetColumnId, moveTaskDto.position);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error moviendo tarea: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProjectMembers(projectId) {
        try {
            const members = await this.boardService.getProjectMembers(projectId);
            return {
                success: true,
                data: members
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error obteniendo miembros: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addProjectMember(projectId, addMemberDto) {
        try {
            const testUserId = 'test-user-123';
            let validatedRole = addMemberDto.role;
            if (addMemberDto.role === 'owner') {
                validatedRole = 'member';
            }
            const member = await this.boardService.addProjectMember({
                projectId,
                userId: addMemberDto.userId,
                role: validatedRole,
                invitedBy: addMemberDto.invitedBy || testUserId
            });
            return {
                success: true,
                data: member
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error añadiendo miembro: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.BoardController = BoardController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BoardController.prototype, "getTest", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getBoardByProject", null);
__decorate([
    (0, common_1.Post)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "createBoard", null);
__decorate([
    (0, common_1.Post)(':boardId/columns'),
    __param(0, (0, common_1.Param)('boardId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "createColumn", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getTask", null);
__decorate([
    (0, common_1.Post)('columns/:columnId/tasks'),
    __param(0, (0, common_1.Param)('columnId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "createTask", null);
__decorate([
    (0, common_1.Put)('tasks/:taskId/move'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "moveTask", null);
__decorate([
    (0, common_1.Get)('project/:projectId/members'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getProjectMembers", null);
__decorate([
    (0, common_1.Post)('project/:projectId/members'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "addProjectMember", null);
exports.BoardController = BoardController = __decorate([
    (0, common_1.Controller)('boards'),
    __metadata("design:paramtypes", [board_service_1.BoardService])
], BoardController);
//# sourceMappingURL=board.controller.js.map