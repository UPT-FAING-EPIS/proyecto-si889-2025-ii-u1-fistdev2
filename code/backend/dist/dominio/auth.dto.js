"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordDto = exports.ChangePasswordDto = exports.AuthResponseDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'juan@ejemplo.com',
        description: 'Email del usuario (único en el sistema)'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email debe tener formato válido' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'password123',
        description: 'Contraseña del usuario (mínimo 6 caracteres)',
        minLength: 6
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Contraseña debe tener al menos 6 caracteres' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Juan Pérez',
        description: 'Nombre completo del usuario'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Nombre debe tener al menos 2 caracteres' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'developer',
        description: 'Rol del usuario en el sistema',
        required: false,
        enum: ['admin', 'developer', 'designer', 'manager']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "rol", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'juanperez',
        description: 'Username o email del usuario registrado'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Username o email es requerido' }),
    __metadata("design:type", String)
], LoginDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'password123',
        description: 'Contraseña del usuario'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Contraseña es requerida' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Token JWT para autenticación'
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Información del usuario autenticado',
        example: {
            id: 'user_1634567890123_abc123def',
            email: 'juan@ejemplo.com',
            username: 'juanperez',
            name: 'Juan Pérez',
            role: 'user'
        }
    }),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "user", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'oldpassword123',
        description: 'Contraseña actual del usuario'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'newpassword456',
        description: 'Nueva contraseña (mínimo 6 caracteres)',
        minLength: 6
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Nueva contraseña debe tener al menos 6 caracteres' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'juan@ejemplo.com',
        description: 'Email del usuario para reset de contraseña'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email debe tener formato válido' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
//# sourceMappingURL=auth.dto.js.map