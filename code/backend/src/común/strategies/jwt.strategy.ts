import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../modules/auth/auth.service';
import { LoggerService } from '../logger.service';

/**
 * Estrategia JWT para validar tokens de autenticación
 * Implementa la validación automática de tokens en rutas protegidas
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret-key-change-in-production'),
      issuer: 'devflow-system',
      audience: 'devflow-users',
    });
  }

  async validate(payload: any) {
    try {
      this.logger.debug(`🔍 Validando JWT payload para usuario: ${payload.email}`, 'JwtStrategy');

      // Validar que el payload tenga la estructura esperada
      if (!payload.sub || !payload.email) {
        this.logger.warn('❌ JWT payload inválido - faltan campos requeridos', 'JwtStrategy');
        throw new UnauthorizedException('Token inválido');
      }

      // Validar que el usuario aún existe y está activo
      const user = await this.authService.validateUser(payload.sub);
      if (!user) {
        this.logger.warn(`❌ Usuario no encontrado o inactivo: ${payload.email}`, 'JwtStrategy');
        throw new UnauthorizedException('Usuario no autorizado');
      }

      this.logger.debug(`✅ JWT validado exitosamente para: ${user.email}`, 'JwtStrategy');

      // El objeto retornado será añadido a req.user
      return {
        id: user.id,
        userId: user.id, // Para compatibilidad con ProjectController
        email: user.email,
        username: user.name,
        name: user.name,
        role: (user.roles[0] === 'admin') ? 'admin' : 'user',
      };
    } catch (error) {
      this.logger.error(
        `Error validando JWT: ${error.message}`,
        error.stack,
        'JwtStrategy'
      );
      throw new UnauthorizedException('Token inválido');
    }
  }
}
