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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const logger_service_1 = require("../../com\u00FAn/logger.service");
const user_repository_1 = require("./user.repository");
let AuthService = class AuthService {
    constructor(jwtService, configService, logger, userRepository) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = logger;
        this.userRepository = userRepository;
        this.saltRounds = 12;
    }
    async register(registerDto) {
        try {
            this.logger.authInfo('Iniciando proceso de registro', {
                email: registerDto.email,
                name: registerDto.name
            }, 'AuthService');
            const existingUserByEmail = await this.userRepository.findByEmail(registerDto.email);
            if (existingUserByEmail) {
                this.logger.authWarn('Intento de registro con email existente', {
                    email: registerDto.email
                }, 'AuthService');
                throw new common_1.ConflictException('El email ya está registrado');
            }
            this.logger.authDebug('Email disponible, procediendo con hash de contraseña', {
                email: registerDto.email
            }, 'AuthService');
            const password = await bcrypt.hash(registerDto.password, this.saltRounds);
            this.logger.authDebug('Contraseña hasheada, creando usuario en base de datos', {
                email: registerDto.email
            }, 'AuthService');
            const newUser = await this.userRepository.create({
                email: registerDto.email,
                name: registerDto.name,
                password,
                roles: registerDto.rol ? [registerDto.rol] : ['user'],
            });
            this.logger.authDebug('Usuario creado en base de datos, generando JWT', {
                userId: newUser.id,
                email: newUser.email
            }, 'AuthService');
            const payload = {
                sub: newUser.id,
                email: newUser.email,
                name: newUser.name,
                roles: newUser.roles
            };
            const accessToken = this.jwtService.sign(payload);
            this.logger.authInfo('Registro completado exitosamente', {
                userId: newUser.id,
                email: registerDto.email,
                role: newUser.roles[0]
            }, 'AuthService');
            return {
                accessToken,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.name,
                    name: newUser.name,
                    role: (newUser.roles[0] === 'admin') ? 'admin' : 'user',
                },
            };
        }
        catch (error) {
            this.logger.authError('Error en proceso de registro', {
                email: registerDto.email,
                errorType: error.constructor.name,
                errorMessage: error.message
            }, error, 'AuthService');
            throw error;
        }
    }
    async login(loginDto) {
        try {
            this.logger.authInfo('Iniciando proceso de login', {
                identifier: loginDto.identifier
            }, 'AuthService');
            this.logger.authDebug('Buscando usuario en base de datos', {
                identifier: loginDto.identifier
            }, 'AuthService');
            const user = await this.userRepository.findByIdentifier(loginDto.identifier);
            if (!user) {
                this.logger.authWarn('Intento de login con identifier no encontrado', {
                    identifier: loginDto.identifier
                }, 'AuthService');
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            this.logger.authDebug('Usuario encontrado, verificando contraseña', {
                userId: user.id,
                email: user.email
            }, 'AuthService');
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                this.logger.authWarn('Intento de login con contraseña incorrecta', {
                    identifier: loginDto.identifier,
                    userId: user.id,
                    email: user.email
                }, 'AuthService');
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            this.logger.authDebug('Contraseña válida, generando JWT token', {
                userId: user.id,
                email: user.email,
                roles: user.roles
            }, 'AuthService');
            const payload = {
                sub: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles
            };
            const accessToken = this.jwtService.sign(payload);
            this.logger.authInfo('Login completado exitosamente', {
                userId: user.id,
                email: user.email,
                identifier: loginDto.identifier,
                role: user.roles[0]
            }, 'AuthService');
            return {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.name,
                    name: user.name,
                    role: (user.roles[0] === 'admin') ? 'admin' : 'user',
                },
            };
        }
        catch (error) {
            this.logger.authError('Error en proceso de login', {
                identifier: loginDto.identifier,
                errorType: error.constructor.name,
                errorMessage: error.message
            }, error, 'AuthService');
            throw error;
        }
    }
    async validateUser(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                this.logger.warn(`❌ Validación fallida para usuario ID: ${userId}`, 'AuthService');
                return null;
            }
            this.logger.debug(`✅ Usuario validado: ${user.email}`, 'AuthService');
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            };
        }
        catch (error) {
            this.logger.error(`Error validando usuario ${userId}: ${error.message}`, error.stack, 'AuthService');
            return null;
        }
    }
    async findUserByEmail(email) {
        try {
            this.logger.debug(`🔍 Buscando usuario por email: ${email}`, 'AuthService');
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                this.logger.debug(`❌ Usuario no encontrado: ${email}`, 'AuthService');
                return null;
            }
            this.logger.debug(`✅ Usuario encontrado: ${user.email}`, 'AuthService');
            return {
                id: user.id,
                email: user.email,
                username: user.name,
                name: user.name,
                role: (user.roles[0] === 'admin') ? 'admin' : 'user',
            };
        }
        catch (error) {
            this.logger.error(`Error buscando usuario por email ${email}: ${error.message}`, error.stack, 'AuthService');
            return null;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            this.logger.log(`🔄 Iniciando cambio de password para usuario ID: ${userId}`, 'AuthService');
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                this.logger.warn(`❌ Intento de cambio de password con contraseña actual incorrecta: ${userId}`, 'AuthService');
                throw new common_1.UnauthorizedException('Contraseña actual incorrecta');
            }
            const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);
            await this.userRepository.updatePassword(userId, newPasswordHash);
            this.logger.log(`✅ Password cambiado exitosamente para usuario ID: ${userId}`, 'AuthService');
        }
        catch (error) {
            this.logger.error(`Error en cambio de password para ${userId}: ${error.message}`, error.stack, 'AuthService');
            throw error;
        }
    }
    async getServiceStatus() {
        try {
            const userCount = await this.userRepository.count();
            const isHealthy = await this.userRepository.healthCheck();
            return {
                service: 'AuthService',
                status: isHealthy ? 'healthy' : 'unhealthy',
                userCount,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Error obteniendo status del servicio: ${error.message}`, error.stack, 'AuthService');
            return {
                service: 'AuthService',
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        logger_service_1.LoggerService,
        user_repository_1.UserRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map