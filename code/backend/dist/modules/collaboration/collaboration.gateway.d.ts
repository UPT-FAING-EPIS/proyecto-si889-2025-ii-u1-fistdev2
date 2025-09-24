import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../../común/logger.service';
import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../../común/prisma.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userEmail?: string;
    userName?: string;
}
export interface BoardEvent {
    type: string;
    projectId: string;
    actor: {
        id: string;
        email: string;
        name: string;
    };
    timestamp: Date;
    payload: any;
}
export declare class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private logger;
    private membershipService;
    private prisma;
    server: Server;
    private userSockets;
    private projectConnections;
    constructor(jwtService: JwtService, logger: LoggerService, membershipService: MembershipService, prisma: PrismaService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinProject(client: AuthenticatedSocket, data: {
        projectId: string;
    }): Promise<void>;
    handleLeaveProject(client: AuthenticatedSocket, data: {
        projectId: string;
    }): Promise<void>;
    emitBoardEvent(projectId: string, event: BoardEvent): Promise<void>;
    emitMemberAdded(projectId: string, memberInfo: any, actorInfo: any): Promise<void>;
    emitMemberRemoved(projectId: string, removedMemberInfo: any, actorInfo: any): Promise<void>;
    getProjectOnlineUsers(projectId: string): string[];
    getPresenceStats(): {
        totalConnected: number;
        projectConnections: number;
    };
}
export {};
