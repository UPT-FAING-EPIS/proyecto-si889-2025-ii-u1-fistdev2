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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("../../dominio/auth.dto");
const jwt_auth_guard_1 = require("../../com\u00FAn/guards/jwt-auth.guard");
const logger_service_1 = require("../../com\u00FAn/logger.service");
let AuthController = class AuthController {
    constructor(authService, logger) {
        this.authService = authService;
        this.logger = logger;
    }
    async register(registerDto) {
        this.logger.log(`🔄 Intento de registro: ${registerDto.email}`, 'AuthController');
        try {
            const result = await this.authService.register(registerDto);
            this.logger.log(`✅ Registro exitoso: ${registerDto.email}`, 'AuthController');
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error en registro: ${error.message}`, error.stack, 'AuthController');
            throw error;
        }
    }
    async login(loginDto) {
        this.logger.log(`🔄 Intento de login: ${loginDto.identifier}`, 'AuthController');
        try {
            const result = await this.authService.login(loginDto);
            this.logger.log(`✅ Login exitoso: ${loginDto.identifier}`, 'AuthController');
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Error en login: ${error.message}`, error.stack, 'AuthController');
            throw error;
        }
    }
    async getProfile(req) {
        this.logger.debug(`🔍 Consulta de perfil: ${req.user.email}`, 'AuthController');
        return {
            message: 'Perfil obtenido exitosamente',
            user: req.user,
            timestamp: new Date().toISOString(),
        };
    }
    async findUserByEmail(email) {
        try {
            this.logger.debug(`🔍 Buscando usuario con email: ${email}`, 'AuthController');
            if (!email) {
                this.logger.warn('❌ Email no proporcionado para búsqueda', 'AuthController');
                throw new Error('Email es requerido');
            }
            const user = await this.authService.findUserByEmail(email);
            if (!user) {
                this.logger.debug(`❌ Usuario no encontrado: ${email}`, 'AuthController');
                return { message: 'Usuario no encontrado', status: 404 };
            }
            this.logger.debug(`✅ Usuario encontrado: ${user.email}`, 'AuthController');
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username
            };
        }
        catch (error) {
            this.logger.error(`❌ Error buscando usuario: ${error.message}`, error.stack, 'AuthController');
            throw error;
        }
    }
    async validateUserByEmail(email) {
        try {
            this.logger.debug(`🔍 Validando usuario con email: ${email}`, 'AuthController');
            if (!email) {
                this.logger.warn('❌ Email no proporcionado para validación', 'AuthController');
                throw new Error('Email es requerido');
            }
            const user = await this.authService.findUserByEmail(email);
            this.logger.debug(`✅ Usuario validado: ${user ? 'encontrado' : 'no encontrado'}`, 'AuthController');
            return {
                exists: !!user,
                user: user ? { id: user.id, email: user.email, name: user.name } : null
            };
        }
        catch (error) {
            this.logger.error(`❌ Error validando usuario: ${error.message}`, error.stack, 'AuthController');
            throw error;
        }
    }
    async getAuthHealth() {
        try {
            const status = await this.authService.getServiceStatus();
            this.logger.debug('✅ Health check de autenticación realizado', 'AuthController');
            return status;
        }
        catch (error) {
            this.logger.error(`❌ Error en health check: ${error.message}`, error.stack, 'AuthController');
            return {
                service: 'AuthService',
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar nuevo usuario',
        description: 'Crear una nueva cuenta de usuario en el sistema'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.RegisterDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario registrado exitosamente',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos de registro inválidos'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'El email ya está registrado'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Iniciar sesión',
        description: 'Autenticar usuario y obtener token JWT'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login exitoso',
        type: auth_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Credenciales inválidas'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener perfil del usuario',
        description: 'Recuperar información del usuario autenticado'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil del usuario obtenido exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token inválido o expirado'
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('find-user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Buscar usuario por email (público)',
        description: 'Buscar si existe un usuario con el email proporcionado - endpoint público'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario encontrado'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado'
    }),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "findUserByEmail", null);
__decorate([
    (0, common_1.Get)('validate-user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Validar si un usuario existe por email',
        description: 'Verificar si existe un usuario con el email proporcionado'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario validado exitosamente'
    }),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateUserByEmail", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check del servicio de autenticación',
        description: 'Verificar el estado del servicio de autenticación'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado del servicio de autenticación'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAuthHealth", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        logger_service_1.LoggerService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map