export declare class BoardController {
    test(): Promise<{
        success: boolean;
        message: string;
        timestamp: Date;
    }>;
    getBoardByProject(projectId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            projectId: string;
            name: string;
            description: string;
            columns: any[];
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
        };
        message: string;
    }>;
}
