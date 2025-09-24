import { MembershipService } from './membership.service';
import { LoggerService } from '../../común/logger.service';
export declare class MembershipController {
    private membershipService;
    private logger;
    constructor(membershipService: MembershipService, logger: LoggerService);
    inviteToProject(projectId: string, body: {
        emails: string[];
        role?: string;
    }, req: any): Promise<{
        success: boolean;
        data: {
            invited: string[];
            alreadyMembers: string[];
        };
        message: string;
    }>;
    getProjectMembers(projectId: string, req: any): Promise<{
        success: boolean;
        data: import("./membership.service").ProjectMemberDto[];
        total: number;
    }>;
    removeMember(projectId: string, memberId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    acceptInvitation(token: string, req: any): Promise<{
        success: boolean;
        data: {
            projectId: string;
            projectName: string;
        };
        message: string;
    }>;
    getUserProjects(req: any): Promise<{
        success: boolean;
        data: import("./membership.service").UserProjectDto[];
        total: number;
    }>;
    getPendingInvitations(req: any): Promise<{
        success: boolean;
        data: any[];
        total: number;
    }>;
    checkMembership(projectId: string, req: any): Promise<{
        success: boolean;
        data: {
            isMember: boolean;
            role?: "OWNER" | "MEMBER" | "VIEWER";
        };
    }>;
    getMyInvitations(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    rejectInvitation(invitationId: string, req: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
