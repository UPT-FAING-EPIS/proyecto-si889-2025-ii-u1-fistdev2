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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const logger_service_1 = require("../logger.service");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(logger) {
        super();
        this.logger = logger;
    }
    canActivate(context) {
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        const method = request.method;
        if (err) {
            this.logger.error(`❌ Error JWT en ${method} ${url}: ${err.message}`, err.stack, 'JwtAuthGuard');
        }
        if (info) {
            this.logger.warn(`⚠️ Info JWT en ${method} ${url}: ${JSON.stringify(info)}`, 'JwtAuthGuard');
        }
        if (!user && !err) {
            this.logger.warn(`❌ Usuario no encontrado en ${method} ${url}`, 'JwtAuthGuard');
        }
        if (err || !user) {
            let errorMessage = 'Token JWT inválido o expirado';
            if (info?.name === 'TokenExpiredError') {
                errorMessage = 'Token JWT expirado';
            }
            else if (info?.name === 'JsonWebTokenError') {
                errorMessage = 'Token JWT malformado';
            }
            else if (info?.name === 'NotBeforeError') {
                errorMessage = 'Token JWT no válido aún';
            }
            else if (err?.message) {
                errorMessage = err.message;
            }
            this.logger.error(`❌ Autenticación fallida en ${method} ${url}: ${errorMessage}`, null, 'JwtAuthGuard');
            throw new common_1.UnauthorizedException(errorMessage);
        }
        this.logger.debug(`✅ Autenticación exitosa en ${method} ${url} para usuario: ${user.email}`, 'JwtAuthGuard');
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map