import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para registro de nuevos usuarios
 */
export class RegisterDto {
  @ApiProperty({ 
    example: 'juan@ejemplo.com',
    description: 'Email del usuario (único en el sistema)' 
  })
  @IsEmail({}, { message: 'Email debe tener formato válido' })
  email: string;



  @ApiProperty({ 
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    minLength: 6 
  })
  @IsString()
  @MinLength(6, { message: 'Contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ 
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario' 
  })
  @IsString()
  @MinLength(2, { message: 'Nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiProperty({ 
    example: 'developer',
    description: 'Rol del usuario en el sistema',
    required: false,
    enum: ['admin', 'developer', 'designer', 'manager']
  })
  @IsOptional()
  @IsString()
  rol?: string;
}

/**
 * DTO para login de usuarios existentes
 */
export class LoginDto {
  @ApiProperty({ 
    example: 'juanperez',
    description: 'Username o email del usuario registrado' 
  })
  @IsString()
  @MinLength(1, { message: 'Username o email es requerido' })
  identifier: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'Contraseña del usuario' 
  })
  @IsString()
  @MinLength(1, { message: 'Contraseña es requerida' })
  password: string;
}

/**
 * DTO de respuesta para autenticación exitosa
 */
export class AuthResponseDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticación' 
  })
  accessToken: string;

  @ApiProperty({ 
    description: 'Información del usuario autenticado',
    example: {
      id: 'user_1634567890123_abc123def',
      email: 'juan@ejemplo.com',
      username: 'juanperez',
      name: 'Juan Pérez',
      role: 'user'
    }
  })
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: 'admin' | 'user';
  };
}

/**
 * DTO para cambio de contraseña
 */
export class ChangePasswordDto {
  @ApiProperty({ 
    example: 'oldpassword123',
    description: 'Contraseña actual del usuario' 
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({ 
    example: 'newpassword456',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
    minLength: 6 
  })
  @IsString()
  @MinLength(6, { message: 'Nueva contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}

/**
 * DTO para solicitar reset de contraseña
 */
export class ForgotPasswordDto {
  @ApiProperty({ 
    example: 'juan@ejemplo.com',
    description: 'Email del usuario para reset de contraseña' 
  })
  @IsEmail({}, { message: 'Email debe tener formato válido' })
  email: string;
}
