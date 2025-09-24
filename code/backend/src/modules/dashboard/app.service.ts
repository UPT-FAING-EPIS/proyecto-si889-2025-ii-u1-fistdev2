import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio principal de la aplicación
 * Maneja funcionalidades básicas de información y estado
 */
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getAppInfo() {
    return {
      name: 'DevFlow System',
      description: 'Sistema completo de desarrollo web auto-hospedado',
      version: this.getVersion().version,
      environment: this.configService.get('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
      features: [
        'Autenticación JWT',
        'Editor de código integrado',
        'Terminal web',
        'Gestor de archivos',
        'Contenedores Docker',
        'Base de datos PostgreSQL',
        'Cache Redis',
        'Monitoreo y logs'
      ]
    };
  }

  getHealthStatus() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutos ${Math.floor(uptime % 60)} segundos`,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      node_version: process.version,
      platform: process.platform,
      environment: this.configService.get('NODE_ENV', 'development'),
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      sprint: '0.5 - Authentication System',
      commit: 'dev-build',
    };
  }
}
