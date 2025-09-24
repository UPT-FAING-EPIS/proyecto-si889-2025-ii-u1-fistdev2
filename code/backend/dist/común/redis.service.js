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
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
let CacheService = class CacheService {
    constructor(logger) {
        this.logger = logger;
        this.cache = new Map();
        this.ttlMap = new Map();
    }
    async onModuleInit() {
        this.logger.log('✅ Cache service inicializado (modo simulado)', 'CacheService');
    }
    async onModuleDestroy() {
        this.cache.clear();
        this.ttlMap.clear();
        this.logger.log('✅ Cache service cerrado', 'CacheService');
    }
    async set(key, value, ttlSeconds) {
        try {
            this.cache.set(key, value);
            if (ttlSeconds) {
                const expirationTime = Date.now() + (ttlSeconds * 1000);
                this.ttlMap.set(key, expirationTime);
                setTimeout(() => {
                    this.cache.delete(key);
                    this.ttlMap.delete(key);
                }, ttlSeconds * 1000);
            }
            this.logger.debug(`Cache SET: ${key}`, 'CacheService');
        }
        catch (error) {
            this.logger.error(`Error al guardar en cache (${key}): ${error.message}`, error.stack, 'CacheService');
            throw error;
        }
    }
    async get(key) {
        try {
            const expirationTime = this.ttlMap.get(key);
            if (expirationTime && Date.now() > expirationTime) {
                this.cache.delete(key);
                this.ttlMap.delete(key);
                this.logger.debug(`Cache EXPIRED: ${key}`, 'CacheService');
                return null;
            }
            const value = this.cache.get(key);
            if (value === undefined) {
                this.logger.debug(`Cache MISS: ${key}`, 'CacheService');
                return null;
            }
            this.logger.debug(`Cache HIT: ${key}`, 'CacheService');
            return value;
        }
        catch (error) {
            this.logger.error(`Error al obtener del cache (${key}): ${error.message}`, error.stack, 'CacheService');
            return null;
        }
    }
    async del(key) {
        try {
            this.cache.delete(key);
            this.ttlMap.delete(key);
            this.logger.debug(`Cache DEL: ${key}`, 'CacheService');
        }
        catch (error) {
            this.logger.error(`Error al eliminar del cache (${key}): ${error.message}`, error.stack, 'CacheService');
        }
    }
    async setUserSession(userId, sessionData, ttlSeconds = 3600) {
        const key = `session:${userId}`;
        await this.set(key, sessionData, ttlSeconds);
    }
    async getUserSession(userId) {
        const key = `session:${userId}`;
        return this.get(key);
    }
    async deleteUserSession(userId) {
        const key = `session:${userId}`;
        await this.del(key);
    }
    async healthCheck() {
        try {
            return true;
        }
        catch (error) {
            this.logger.error(`Cache health check falló: ${error.message}`, error.stack, 'CacheService');
            return false;
        }
    }
    async getStats() {
        return {
            connected: true,
            keys: this.cache.size,
            mode: 'memory_simulation'
        };
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], CacheService);
//# sourceMappingURL=redis.service.js.map