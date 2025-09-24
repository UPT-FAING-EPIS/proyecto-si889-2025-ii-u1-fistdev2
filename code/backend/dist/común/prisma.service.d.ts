import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from './logger.service';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private connected;
    constructor(logger: LoggerService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isHealthy(): Promise<boolean>;
    getStats(): Promise<{
        connected: boolean;
        totalUsers: number;
        totalProjects: number;
        mode: string;
        timestamp: string;
        error?: undefined;
    } | {
        connected: boolean;
        error: any;
        mode: string;
        timestamp: string;
        totalUsers?: undefined;
        totalProjects?: undefined;
    }>;
    runMigrations(): Promise<void>;
}
