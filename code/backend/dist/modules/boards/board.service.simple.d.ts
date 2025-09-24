export declare class BoardService {
    getBoardByProjectId(projectId: string): Promise<{
        id: string;
        projectId: string;
        name: string;
        description: string;
        columns: any[];
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
    }>;
    checkMemberPermission(projectId: string, userId: string, role?: string): Promise<boolean>;
    addProjectMember(memberData: any): Promise<any>;
}
