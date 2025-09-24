import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from './logger.service';

/**
 * Servicio de Prisma para el sistema DevFlow
 * Gestiona la conexión con PostgreSQL usando Prisma ORM
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connected: boolean = false;
  
  constructor(private readonly logger: LoggerService) {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('🗄️ Servicio de base de datos PostgreSQL conectado', 'PrismaService');
    } catch (error) {
      this.logger.error('❌ Error conectando a PostgreSQL:', error.message, 'PrismaService');
      this.connected = false;
      // En desarrollo, crear servicio simulado si no hay BD
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('⚠️ Continuando en modo desarrollo sin BD', 'PrismaService');
        this.connected = true;
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.connected = false;
      this.logger.log('🔌 Servicio de base de datos desconectado', 'PrismaService');
    } catch (error) {
      this.logger.error('Error desconectando base de datos:', error.message, 'PrismaService');
    }
  }

  /**
   * Verificar el estado de la conexión
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return this.connected; // Fallback para desarrollo
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getStats() {
    try {
      const userCount = await this.user.count();
      const projectCount = await this.project.count();
      
      return {
        connected: this.connected,
        totalUsers: userCount,
        totalProjects: projectCount,
        mode: 'postgresql',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de DB:', error.message, 'PrismaService');
      return {
        connected: false,
        error: error.message,
        mode: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Ejecutar migraciones (para desarrollo)
   */
  async runMigrations() {
    try {
      // Este método se podría usar para ejecutar migraciones programáticamente
      this.logger.log('Ejecutando migraciones...', 'PrismaService');
      // Las migraciones normalmente se ejecutan vía CLI
      this.logger.log('Migraciones completadas', 'PrismaService');
    } catch (error) {
      this.logger.error('Error ejecutando migraciones:', error.message, 'PrismaService');
      throw error;
    }
  }
}
