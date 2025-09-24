import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { LoggerService } from '../../común/logger.service';
import { CacheService } from '../../común/redis.service';
import { PrismaService } from '../../común/prisma.service';
import { JwtAuthGuard } from '../../común/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../común/guards/local-auth.guard';
import { JwtStrategy } from '../../común/strategies/jwt.strategy';

/**
 * Módulo de autenticación que centraliza todos los componentes relacionados
 * con autenticación, autorización y manejo de sesiones
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-secret-key-change-in-production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
          issuer: 'devflow-system',
          audience: 'devflow-users',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    LoggerService,
    CacheService,
    PrismaService,
    JwtAuthGuard,
    LocalAuthGuard,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    UserRepository,
    LoggerService,
    CacheService,
    JwtAuthGuard,
    LocalAuthGuard,
  ],
})
export class AuthModule {}
