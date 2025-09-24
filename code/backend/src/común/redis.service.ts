import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Servicio de cache simplificado (simulado en memoria)
 * En producción se conectará a Redis
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private cache = new Map<string, any>();
  private ttlMap = new Map<string, number>();

  constructor(private logger: LoggerService) {}

  async onModuleInit() {
    this.logger.log('✅ Cache service inicializado (modo simulado)', 'CacheService');
  }

  async onModuleDestroy() {
    this.cache.clear();
    this.ttlMap.clear();
    this.logger.log('✅ Cache service cerrado', 'CacheService');
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      this.cache.set(key, value);
      
      if (ttlSeconds) {
        const expirationTime = Date.now() + (ttlSeconds * 1000);
        this.ttlMap.set(key, expirationTime);
        
        // Auto-cleanup después del TTL
        setTimeout(() => {
          this.cache.delete(key);
          this.ttlMap.delete(key);
        }, ttlSeconds * 1000);
      }
      
      this.logger.debug(`Cache SET: ${key}`, 'CacheService');
    } catch (error) {
      this.logger.error(`Error al guardar en cache (${key}): ${error.message}`, error.stack, 'CacheService');
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // Verificar TTL
      const expirationTime = this.ttlMap.get(key);
      if (expirationTime && Date.now() > expirationTime) {
        this.cache.delete(key);
        this.ttlMap.delete(key);
        this.logger.debug(`Cache EXPIRED: ${key}`, 'CacheService');
        return null;
      }

      const value = this.cache.get(key);
      if (value === undefined) {
        this.logger.debug(`Cache MISS: ${key}`, 'CacheService');
        return null;
      }
      
      this.logger.debug(`Cache HIT: ${key}`, 'CacheService');
      return value as T;
    } catch (error) {
      this.logger.error(`Error al obtener del cache (${key}): ${error.message}`, error.stack, 'CacheService');
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      this.logger.debug(`Cache DEL: ${key}`, 'CacheService');
    } catch (error) {
      this.logger.error(`Error al eliminar del cache (${key}): ${error.message}`, error.stack, 'CacheService');
    }
  }

  async setUserSession(userId: string, sessionData: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `session:${userId}`;
    await this.set(key, sessionData, ttlSeconds);
  }

  async getUserSession<T>(userId: string): Promise<T | null> {
    const key = `session:${userId}`;
    return this.get<T>(key);
  }

  async deleteUserSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.del(key);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simulación - siempre retorna true en modo memoria
      return true;
    } catch (error) {
      this.logger.error(`Cache health check falló: ${error.message}`, error.stack, 'CacheService');
      return false;
    }
  }

  async getStats() {
    return {
      connected: true,
      keys: this.cache.size,
      mode: 'memory_simulation'
    };
  }
}
