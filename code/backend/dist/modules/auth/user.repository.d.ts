import { LoggerService } from '../../común/logger.service';
import { PrismaService } from '../../común/prisma.service';
export declare class UserRepository {
    private logger;
    private prisma;
    constructor(logger: LoggerService, prisma: PrismaService);
    private initializeAdminUser;
    findByEmail(email: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roles: string[];
        lastSeen: Date | null;
    }>;
    findByUsername(username: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roles: string[];
        lastSeen: Date | null;
    }>;
    findByIdentifier(identifier: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roles: string[];
        lastSeen: Date | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roles: string[];
        lastSeen: Date | null;
    }>;
    create(userData: {
        email: string;
        name: string;
        password: string;
        roles?: string[];
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roles: string[];
        lastSeen: Date | null;
    }>;
    updatePassword(userId: string, newPassword: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roles: string[];
        lastSeen: Date | null;
    }>;
    count(): Promise<number>;
    getAllUsers(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        roles: string[];
        lastSeen: Date;
    }[]>;
    healthCheck(): Promise<boolean>;
}
