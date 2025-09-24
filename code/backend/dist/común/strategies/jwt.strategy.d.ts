import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../modules/auth/auth.service';
import { LoggerService } from '../logger.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private authService;
    private logger;
    constructor(configService: ConfigService, authService: AuthService, logger: LoggerService);
    validate(payload: any): Promise<{
        id: string;
        userId: string;
        email: string;
        username: string;
        name: string;
        role: string;
    }>;
}
export {};
