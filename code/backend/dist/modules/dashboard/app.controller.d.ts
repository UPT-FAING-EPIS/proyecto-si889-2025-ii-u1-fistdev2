import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getAppInfo(): {
        name: string;
        description: string;
        version: string;
        environment: any;
        timestamp: string;
        features: string[];
    };
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: string;
        memory: {
            used: string;
            total: string;
            external: string;
        };
        node_version: string;
        platform: NodeJS.Platform;
        environment: any;
    };
    getVersion(): {
        version: string;
        buildDate: string;
        sprint: string;
        commit: string;
    };
}
