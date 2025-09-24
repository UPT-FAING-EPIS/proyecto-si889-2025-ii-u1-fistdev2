import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../../dominio/auth.dto';
import { LoggerService } from '../../común/logger.service';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService, logger: LoggerService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    getProfile(req: any): Promise<{
        message: string;
        user: any;
        timestamp: string;
    }>;
    findUserByEmail(email: string): Promise<{
        message: string;
        status: number;
        id?: undefined;
        email?: undefined;
        name?: undefined;
        username?: undefined;
    } | {
        id: string;
        email: string;
        name: string;
        username: string;
        message?: undefined;
        status?: undefined;
    }>;
    validateUserByEmail(email: string): Promise<{
        exists: boolean;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    getAuthHealth(): Promise<{
        service: string;
        status: string;
        userCount: number;
        timestamp: string;
        error?: undefined;
    } | {
        service: string;
        status: string;
        error: any;
        timestamp: string;
        userCount?: undefined;
    }>;
}
