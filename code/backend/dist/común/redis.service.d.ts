import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { LoggerService } from './logger.service';
export declare class CacheService implements OnModuleInit, OnModuleDestroy {
    private logger;
    private cache;
    private ttlMap;
    constructor(logger: LoggerService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    del(key: string): Promise<void>;
    setUserSession(userId: string, sessionData: any, ttlSeconds?: number): Promise<void>;
    getUserSession<T>(userId: string): Promise<T | null>;
    deleteUserSession(userId: string): Promise<void>;
    healthCheck(): Promise<boolean>;
    getStats(): Promise<{
        connected: boolean;
        keys: number;
        mode: string;
    }>;
}
