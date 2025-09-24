import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Servicio de logging simplificado para DevFlow
 */
@Injectable()
export class LoggerService implements NestLoggerService {

  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${context ? `[${context}] ` : ''}${message}`);
  }

  error(message: string, stack?: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${context ? `[${context}] ` : ''}${message}`);
    if (stack) {
      console.error(`[${timestamp}] [ERROR] Stack: ${stack}`);
    }
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${context ? `[${context}] ` : ''}${message}`);
  }

  debug(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] ${context ? `[${context}] ` : ''}${message}`);
  }

  verbose(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
  }

  // Métodos adicionales para casos específicos
  logAuth(action: string, userId?: string, email?: string, success: boolean = true) {
    const level = success ? 'INFO' : 'WARN';
    const message = `Auth ${action}: ${email || userId || 'unknown'} - ${success ? 'SUCCESS' : 'FAILED'}`;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [${level}] [Auth] ${message}`);
  }

  logRequest(method: string, url: string, statusCode: number, responseTime: number) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [HTTP] ${method} ${url} ${statusCode} - ${responseTime}ms`);
  }

  // Métodos específicos para autenticación con mejor detalle
  authInfo(message: string, data?: any, context: string = 'Auth') {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [INFO] [${context}] ${message}${dataStr}`);
  }

  authError(message: string, data?: any, error?: Error, context: string = 'Auth') {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    const errorStr = error ? ` | Error: ${error.message}` : '';
    console.error(`[${timestamp}] [ERROR] [${context}] ${message}${dataStr}${errorStr}`);
    if (error?.stack) {
      console.error(`[${timestamp}] [ERROR] [${context}] Stack: ${error.stack}`);
    }
  }

  authWarn(message: string, data?: any, context: string = 'Auth') {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    console.warn(`[${timestamp}] [WARN] [${context}] ${message}${dataStr}`);
  }

  authDebug(message: string, data?: any, context: string = 'Auth') {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    console.debug(`[${timestamp}] [DEBUG] [${context}] ${message}${dataStr}`);
  }
}
