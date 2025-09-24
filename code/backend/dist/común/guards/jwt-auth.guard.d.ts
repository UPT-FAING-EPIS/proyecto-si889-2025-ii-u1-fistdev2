import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LoggerService } from '../logger.service';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private logger;
    constructor(logger: LoggerService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    handleRequest(err: any, user: any, info: any, context: ExecutionContext): any;
}
export {};
