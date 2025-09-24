"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_repository_1 = require("./user.repository");
const logger_service_1 = require("../../com\u00FAn/logger.service");
const redis_service_1 = require("../../com\u00FAn/redis.service");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
const jwt_auth_guard_1 = require("../../com\u00FAn/guards/jwt-auth.guard");
const local_auth_guard_1 = require("../../com\u00FAn/guards/local-auth.guard");
const jwt_strategy_1 = require("../../com\u00FAn/strategies/jwt.strategy");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET', 'dev-secret-key-change-in-production'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
                        issuer: 'devflow-system',
                        audience: 'devflow-users',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            user_repository_1.UserRepository,
            logger_service_1.LoggerService,
            redis_service_1.CacheService,
            prisma_service_1.PrismaService,
            jwt_auth_guard_1.JwtAuthGuard,
            local_auth_guard_1.LocalAuthGuard,
            jwt_strategy_1.JwtStrategy,
        ],
        exports: [
            auth_service_1.AuthService,
            user_repository_1.UserRepository,
            logger_service_1.LoggerService,
            redis_service_1.CacheService,
            jwt_auth_guard_1.JwtAuthGuard,
            local_auth_guard_1.LocalAuthGuard,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map