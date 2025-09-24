import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../../dominio/auth.dto';
import { JwtAuthGuard } from '../../común/guards/jwt-auth.guard';
import { LoggerService } from '../../común/logger.service';

/**
 * Controlador de autenticación
 * Maneja todas las operaciones relacionadas con registro, login y gestión de usuarios
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crear una nueva cuenta de usuario en el sistema'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de registro inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email ya está registrado' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`🔄 Intento de registro: ${registerDto.email}`, 'AuthController');
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`✅ Registro exitoso: ${registerDto.email}`, 'AuthController');
      return result;
    } catch (error) {
      this.logger.error(`❌ Error en registro: ${error.message}`, error.stack, 'AuthController');
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autenticar usuario y obtener token JWT'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`🔄 Intento de login: ${loginDto.identifier}`, 'AuthController');
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`✅ Login exitoso: ${loginDto.identifier}`, 'AuthController');
      return result;
    } catch (error) {
      this.logger.error(`❌ Error en login: ${error.message}`, error.stack, 'AuthController');
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario',
    description: 'Recuperar información del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o expirado' 
  })
  async getProfile(@Request() req: any) {
    this.logger.debug(`🔍 Consulta de perfil: ${req.user.email}`, 'AuthController');
    return {
      message: 'Perfil obtenido exitosamente',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('find-user')
  @ApiOperation({ 
    summary: 'Buscar usuario por email (público)',
    description: 'Buscar si existe un usuario con el email proporcionado - endpoint público'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async findUserByEmail(@Query('email') email: string) {
    try {
      this.logger.debug(`🔍 Buscando usuario con email: ${email}`, 'AuthController');
      
      if (!email) {
        this.logger.warn('❌ Email no proporcionado para búsqueda', 'AuthController');
        throw new Error('Email es requerido');
      }

      const user = await this.authService.findUserByEmail(email);
      
      if (!user) {
        this.logger.debug(`❌ Usuario no encontrado: ${email}`, 'AuthController');
        return { message: 'Usuario no encontrado', status: 404 };
      }

      this.logger.debug(`✅ Usuario encontrado: ${user.email}`, 'AuthController');
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username
      };
    } catch (error) {
      this.logger.error(`❌ Error buscando usuario: ${error.message}`, error.stack, 'AuthController');
      throw error;
    }
  }

  @Get('validate-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Validar si un usuario existe por email',
    description: 'Verificar si existe un usuario con el email proporcionado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario validado exitosamente' 
  })
  async validateUserByEmail(@Query('email') email: string) {
    try {
      this.logger.debug(`🔍 Validando usuario con email: ${email}`, 'AuthController');
      
      if (!email) {
        this.logger.warn('❌ Email no proporcionado para validación', 'AuthController');
        throw new Error('Email es requerido');
      }

      const user = await this.authService.findUserByEmail(email);
      this.logger.debug(`✅ Usuario validado: ${user ? 'encontrado' : 'no encontrado'}`, 'AuthController');
      
      return {
        exists: !!user,
        user: user ? { id: user.id, email: user.email, name: user.name } : null
      };
    } catch (error) {
      this.logger.error(`❌ Error validando usuario: ${error.message}`, error.stack, 'AuthController');
      throw error;
    }
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Health check del servicio de autenticación',
    description: 'Verificar el estado del servicio de autenticación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del servicio de autenticación' 
  })
  async getAuthHealth() {
    try {
      const status = await this.authService.getServiceStatus();
      this.logger.debug('✅ Health check de autenticación realizado', 'AuthController');
      return status;
    } catch (error) {
      this.logger.error(`❌ Error en health check: ${error.message}`, error.stack, 'AuthController');
      return {
        service: 'AuthService',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
