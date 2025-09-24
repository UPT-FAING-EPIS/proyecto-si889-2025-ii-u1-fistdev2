/**
 * Sistema de logging optimizado para debugging y diagnóstico
 * Incluye diferentes niveles de log y formateo mejorado
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.DEBUG;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    if (level < this.currentLevel) return;

    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      category,
      message,
      data,
      stack: error?.stack
    };

    this.logs.push(logEntry);
    
    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Mostrar en consola con formato mejorado
    this.logToConsole(logEntry);
  }

  private logToConsole(entry: LogEntry): void {
    const emoji = this.getLevelEmoji(entry.level);
    const levelName = LogLevel[entry.level];
    const prefix = `${emoji} [${entry.category}] ${levelName}:`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data || '', entry.stack || '');
        break;
    }
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      default: return '📝';
    }
  }

  debug(category: string, message: string, data?: any): void {
    this.addLog(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.addLog(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.addLog(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any, error?: Error): void {
    this.addLog(LogLevel.ERROR, category, message, data, error);
  }

  // Métodos específicos para autenticación
  authDebug(message: string, data?: any): void {
    this.debug('AUTH', message, data);
  }

  authInfo(message: string, data?: any): void {
    this.info('AUTH', message, data);
  }

  authWarn(message: string, data?: any): void {
    this.warn('AUTH', message, data);
  }

  authError(message: string, data?: any, error?: Error): void {
    this.error('AUTH', message, data, error);
  }

  // Métodos específicos para API
  apiDebug(message: string, data?: any): void {
    this.debug('API', message, data);
  }

  apiInfo(message: string, data?: any): void {
    this.info('API', message, data);
  }

  apiWarn(message: string, data?: any): void {
    this.warn('API', message, data);
  }

  apiError(message: string, data?: any, error?: Error): void {
    this.error('API', message, data, error);
  }

  // Métodos específicos para UI
  uiDebug(message: string, data?: any): void {
    this.debug('UI', message, data);
  }

  uiInfo(message: string, data?: any): void {
    this.info('UI', message, data);
  }

  uiWarn(message: string, data?: any): void {
    this.warn('UI', message, data);
  }

  uiError(message: string, data?: any, error?: Error): void {
    this.error('UI', message, data, error);
  }

  // Obtener logs para debugging
  getLogs(category?: string, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    
    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }
    
    return filteredLogs;
  }

  // Exportar logs como JSON para análisis
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Limpiar logs
  clearLogs(): void {
    this.logs = [];
  }

  // Configurar nivel de log
  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Configurar nivel de log basado en el entorno
if (typeof window !== 'undefined') {
  const isDevelopment = process.env.NODE_ENV === 'development';
  logger.setLogLevel(isDevelopment ? LogLevel.DEBUG : LogLevel.INFO);
}