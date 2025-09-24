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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../../modules/auth/auth.service");
const logger_service_1 = require("../logger.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, authService, logger) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'dev-secret-key-change-in-production'),
            issuer: 'devflow-system',
            audience: 'devflow-users',
        });
        this.configService = configService;
        this.authService = authService;
        this.logger = logger;
    }
    async validate(payload) {
        try {
            this.logger.debug(`🔍 Validando JWT payload para usuario: ${payload.email}`, 'JwtStrategy');
            if (!payload.sub || !payload.email) {
                this.logger.warn('❌ JWT payload inválido - faltan campos requeridos', 'JwtStrategy');
                throw new common_1.UnauthorizedException('Token inválido');
            }
            const user = await this.authService.validateUser(payload.sub);
            if (!user) {
                this.logger.warn(`❌ Usuario no encontrado o inactivo: ${payload.email}`, 'JwtStrategy');
                throw new common_1.UnauthorizedException('Usuario no autorizado');
            }
            this.logger.debug(`✅ JWT validado exitosamente para: ${user.email}`, 'JwtStrategy');
            return {
                id: user.id,
                userId: user.id,
                email: user.email,
                username: user.name,
                name: user.name,
                role: (user.roles[0] === 'admin') ? 'admin' : 'user',
            };
        }
        catch (error) {
            this.logger.error(`Error validando JWT: ${error.message}`, error.stack, 'JwtStrategy');
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService,
        logger_service_1.LoggerService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map