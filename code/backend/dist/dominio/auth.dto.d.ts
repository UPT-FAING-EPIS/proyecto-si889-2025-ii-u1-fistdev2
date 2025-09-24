export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    rol?: string;
}
export declare class LoginDto {
    identifier: string;
    password: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        email: string;
        username: string;
        name: string;
        role: 'admin' | 'user';
    };
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
