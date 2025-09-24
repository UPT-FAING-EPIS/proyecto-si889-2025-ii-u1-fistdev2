import { LoggerService as NestLoggerService } from '@nestjs/common';
export declare class LoggerService implements NestLoggerService {
    log(message: string, context?: string): void;
    error(message: string, stack?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logAuth(action: string, userId?: string, email?: string, success?: boolean): void;
    logRequest(method: string, url: string, statusCode: number, responseTime: number): void;
    authInfo(message: string, data?: any, context?: string): void;
    authError(message: string, data?: any, error?: Error, context?: string): void;
    authWarn(message: string, data?: any, context?: string): void;
    authDebug(message: string, data?: any, context?: string): void;
}
