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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../../com\u00FAn/logger.service");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
const bcrypt = require("bcrypt");
let UserRepository = class UserRepository {
    constructor(logger, prisma) {
        this.logger = logger;
        this.prisma = prisma;
        this.initializeAdminUser();
    }
    async initializeAdminUser() {
        try {
            const adminExists = await this.prisma.user.findUnique({
                where: { email: 'admin@devflow.com' }
            });
            if (!adminExists) {
                const password = await bcrypt.hash('admin123', 12);
                await this.prisma.user.create({
                    data: {
                        email: 'admin@devflow.com',
                        name: 'Administrador',
                        password,
                        roles: ['admin'],
                    }
                });
                this.logger.log('👤 Usuario administrador creado por defecto', 'UserRepository');
            }
        }
        catch (error) {
            this.logger.error(`Error inicializando usuario admin: ${error.message}`, error.stack, 'UserRepository');
        }
    }
    async findByEmail(email) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email }
            });
            this.logger.debug(`Búsqueda usuario por email: ${email} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
            return user;
        }
        catch (error) {
            this.logger.error(`Error al buscar usuario por email (${email}): ${error.message}`, error.stack, 'UserRepository');
            throw error;
        }
    }
    async findByUsername(username) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { name: username }
            });
            this.logger.debug(`Búsqueda usuario por name: ${username} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
            return user;
        }
        catch (error) {
            this.logger.error(`Error al buscar usuario por name (${username}): ${error.message}`, error.stack, 'UserRepository');
            throw error;
        }
    }
    async findByIdentifier(identifier) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { name: identifier }
                    ]
                }
            });
            this.logger.debug(`Búsqueda usuario por identifier: ${identifier} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
            return user;
        }
        catch (error) {
            this.logger.error(`Error al buscar usuario por identifier (${identifier}): ${error.message}`, error.stack, 'UserRepository');
            throw error;
        }
    }
    async findById(id) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
            });
            this.logger.debug(`Búsqueda usuario por ID: ${id} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
            return user;
        }
        catch (error) {
            this.logger.error(`Error al buscar usuario por ID (${id}): ${error.message}`, error.stack, 'UserRepository');
            throw error;
        }
    }
    async create(userData) {
        try {
            const newUser = await this.prisma.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    password: userData.password,
                    roles: userData.roles || ['user'],
                }
            });
            this.logger.log(`Usuario creado exitosamente: ${userData.email}`, 'UserRepository');
            return newUser;
        }
        catch (error) {
            this.logger.error(`Error al crear usuario (${userData.email}): ${error.message}`, error.stack, 'UserRepository');
            throw error;
        }
    }
    async updatePassword(userId, newPassword) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    password: newPassword,
                }
            });
            this.logger.log(`Contraseña actualizada para usuario: ${userId}`, 'UserRepository');
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Error al actualizar contraseña (${userId}): ${error.message}`, error.stack, 'UserRepository');
            throw error;
        }
    }
    async count() {
        try {
            return await this.prisma.user.count();
        }
        catch (error) {
            this.logger.error(`Error al contar usuarios: ${error.message}`, error.stack, 'UserRepository');
            return 0;
        }
    }
    async getAllUsers() {
        try {
            const users = await this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    roles: true,
                    lastSeen: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return users;
        }
        catch (error) {
            this.logger.error(`Error al obtener todos los usuarios: ${error.message}`, error.stack, 'UserRepository');
            return [];
        }
    }
    async healthCheck() {
        try {
            await this.prisma.user.count();
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService,
        prisma_service_1.PrismaService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map