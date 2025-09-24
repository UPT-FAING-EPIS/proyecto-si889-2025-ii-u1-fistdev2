import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { LoggerService } from '../logger.service';

/**
 * Guard para proteger rutas con JWT
 * Verifica que el usuario tenga un token JWT válido
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  constructor(private logger: LoggerService) {
    super();
  }
  
  /**
   * Verifica si el usuario puede acceder a la ruta
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  /**
   * Maneja la respuesta de autenticación
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    const method = request.method;
    
    // Log detallado para debugging
    if (err) {
      this.logger.error(`❌ Error JWT en ${method} ${url}: ${err.message}`, err.stack, 'JwtAuthGuard');
    }
    
    if (info) {
      this.logger.warn(`⚠️ Info JWT en ${method} ${url}: ${JSON.stringify(info)}`, 'JwtAuthGuard');
    }
    
    if (!user && !err) {
      this.logger.warn(`❌ Usuario no encontrado en ${method} ${url}`, 'JwtAuthGuard');
    }

    // Si hay error o no hay usuario, lanzar excepción específica
    if (err || !user) {
      let errorMessage = 'Token JWT inválido o expirado';
      
      if (info?.name === 'TokenExpiredError') {
        errorMessage = 'Token JWT expirado';
      } else if (info?.name === 'JsonWebTokenError') {
        errorMessage = 'Token JWT malformado';
      } else if (info?.name === 'NotBeforeError') {
        errorMessage = 'Token JWT no válido aún';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      this.logger.error(`❌ Autenticación fallida en ${method} ${url}: ${errorMessage}`, null, 'JwtAuthGuard');
      throw new UnauthorizedException(errorMessage);
    }
    
    // Log exitoso
    this.logger.debug(`✅ Autenticación exitosa en ${method} ${url} para usuario: ${user.email}`, 'JwtAuthGuard');
    
    // El usuario ya fue validado por la estrategia JWT
    return user;
  }
}
