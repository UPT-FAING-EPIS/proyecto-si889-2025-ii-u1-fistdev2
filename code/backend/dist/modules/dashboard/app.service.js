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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppService = class AppService {
    constructor(configService) {
        this.configService = configService;
    }
    getAppInfo() {
        return {
            name: 'DevFlow System',
            description: 'Sistema completo de desarrollo web auto-hospedado',
            version: this.getVersion().version,
            environment: this.configService.get('NODE_ENV', 'development'),
            timestamp: new Date().toISOString(),
            features: [
                'Autenticación JWT',
                'Editor de código integrado',
                'Terminal web',
                'Gestor de archivos',
                'Contenedores Docker',
                'Base de datos PostgreSQL',
                'Cache Redis',
                'Monitoreo y logs'
            ]
        };
    }
    getHealthStatus() {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime / 60)} minutos ${Math.floor(uptime % 60)} segundos`,
            memory: {
                used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
            },
            node_version: process.version,
            platform: process.platform,
            environment: this.configService.get('NODE_ENV', 'development'),
        };
    }
    getVersion() {
        return {
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            sprint: '0.5 - Authentication System',
            commit: 'dev-build',
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map