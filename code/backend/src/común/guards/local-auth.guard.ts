import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard para autenticación local (email/password)
 * Usado en el endpoint de login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  
  /**
   * Verifica si las credenciales son válidas
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  /**
   * Maneja la respuesta de autenticación local
   */
  handleRequest(err: any, user: any, info: any) {
    // Si hay error o no hay usuario, lanzar excepción
    if (err || !user) {
      throw err || new Error('Credenciales inválidas');
    }
    
    // Verificar que el usuario esté activo
    if (!user.activo) {
      throw new Error('Usuario desactivado');
    }
    
    return user;
  }
}
