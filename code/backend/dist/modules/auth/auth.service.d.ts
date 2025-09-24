import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto, AuthResponseDto } from 'src/dominio/auth.dto';
import { LoggerService } from '../../común/logger.service';
import { UserRepository } from './user.repository';
export declare class AuthService {
    private jwtService;
    private configService;
    private logger;
    private userRepository;
    private readonly saltRounds;
    constructor(jwtService: JwtService, configService: ConfigService, logger: LoggerService, userRepository: UserRepository);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    validateUser(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        roles: string[];
    }>;
    findUserByEmail(email: string): Promise<{
        id: string;
        email: string;
        username: string;
        name: string;
        role: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    getServiceStatus(): Promise<{
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
