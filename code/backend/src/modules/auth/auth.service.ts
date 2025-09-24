import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AuthResponseDto } from 'src/dominio/auth.dto';
import { LoggerService } from '../../común/logger.service';
import { UserRepository } from './user.repository';

/**
 * Servicio de autenticación con repositorio real
 * Maneja registro, login y validación de usuarios
 */
@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: LoggerService,
    private userRepository: UserRepository,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      this.logger.authInfo('Iniciando proceso de registro', { 
        email: registerDto.email,
        name: registerDto.name 
      }, 'AuthService');

      // Verificar si el usuario ya existe por email
      const existingUserByEmail = await this.userRepository.findByEmail(registerDto.email);
      if (existingUserByEmail) {
        this.logger.authWarn('Intento de registro con email existente', { 
          email: registerDto.email 
        }, 'AuthService');
        throw new ConflictException('El email ya está registrado');
      }

      this.logger.authDebug('Email disponible, procediendo con hash de contraseña', {
        email: registerDto.email
      }, 'AuthService');

      // Hash de la contraseña
      const password = await bcrypt.hash(registerDto.password, this.saltRounds);
      
      this.logger.authDebug('Contraseña hasheada, creando usuario en base de datos', {
        email: registerDto.email
      }, 'AuthService');

      // Crear usuario en el repositorio
      const newUser = await this.userRepository.create({
        email: registerDto.email,
        name: registerDto.name,
        password,
        roles: registerDto.rol ? [registerDto.rol] : ['user'],
      });

      this.logger.authDebug('Usuario creado en base de datos, generando JWT', {
        userId: newUser.id,
        email: newUser.email
      }, 'AuthService');

      // Generar JWT token
      const payload = { 
        sub: newUser.id, 
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles
      };
      const accessToken = this.jwtService.sign(payload);

      this.logger.authInfo('Registro completado exitosamente', { 
        userId: newUser.id,
        email: registerDto.email,
        role: newUser.roles[0]
      }, 'AuthService');

      return {
        accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.name,
          name: newUser.name,
          role: (newUser.roles[0] === 'admin') ? 'admin' : 'user',
        },
      };
    } catch (error) {
      this.logger.authError(
        'Error en proceso de registro',
        { 
          email: registerDto.email,
          errorType: error.constructor.name,
          errorMessage: error.message
        },
        error,
        'AuthService'
      );
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      this.logger.authInfo('Iniciando proceso de login', { 
        identifier: loginDto.identifier 
      }, 'AuthService');

      // Buscar usuario por email o username
      this.logger.authDebug('Buscando usuario en base de datos', {
        identifier: loginDto.identifier
      }, 'AuthService');

      const user = await this.userRepository.findByIdentifier(loginDto.identifier);
      if (!user) {
        this.logger.authWarn('Intento de login con identifier no encontrado', { 
          identifier: loginDto.identifier 
        }, 'AuthService');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.authDebug('Usuario encontrado, verificando contraseña', {
        userId: user.id,
        email: user.email
      }, 'AuthService');

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.authWarn('Intento de login con contraseña incorrecta', { 
          identifier: loginDto.identifier,
          userId: user.id,
          email: user.email
        }, 'AuthService');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.authDebug('Contraseña válida, generando JWT token', {
        userId: user.id,
        email: user.email,
        roles: user.roles
      }, 'AuthService');

      // Generar JWT token
      const payload = { 
        sub: user.id, 
        email: user.email,
        name: user.name,
        roles: user.roles
      };
      const accessToken = this.jwtService.sign(payload);

      this.logger.authInfo('Login completado exitosamente', { 
        userId: user.id,
        email: user.email,
        identifier: loginDto.identifier,
        role: user.roles[0]
      }, 'AuthService');

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.name,
          name: user.name,
          role: (user.roles[0] === 'admin') ? 'admin' : 'user',
        },
      };
    } catch (error) {
      this.logger.authError(
        'Error en proceso de login',
        { 
          identifier: loginDto.identifier,
          errorType: error.constructor.name,
          errorMessage: error.message
        },
        error,
        'AuthService'
      );
      throw error;
    }
  }

  async validateUser(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.warn(`❌ Validación fallida para usuario ID: ${userId}`, 'AuthService');
        return null;
      }

      this.logger.debug(`✅ Usuario validado: ${user.email}`, 'AuthService');
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      };
    } catch (error) {
      this.logger.error(
        `Error validando usuario ${userId}: ${error.message}`,
        error.stack,
        'AuthService'
      );
      return null;
    }
  }

  async findUserByEmail(email: string) {
    try {
      this.logger.debug(`🔍 Buscando usuario por email: ${email}`, 'AuthService');
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        this.logger.debug(`❌ Usuario no encontrado: ${email}`, 'AuthService');
        return null;
      }

      this.logger.debug(`✅ Usuario encontrado: ${user.email}`, 'AuthService');
      return {
        id: user.id,
        email: user.email,
        username: user.name,
        name: user.name,
        role: (user.roles[0] === 'admin') ? 'admin' : 'user',
      };
    } catch (error) {
      this.logger.error(
        `Error buscando usuario por email ${email}: ${error.message}`,
        error.stack,
        'AuthService'
      );
      return null;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      this.logger.log(`🔄 Iniciando cambio de password para usuario ID: ${userId}`, 'AuthService');

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        this.logger.warn(`❌ Intento de cambio de password con contraseña actual incorrecta: ${userId}`, 'AuthService');
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);
      await this.userRepository.updatePassword(userId, newPasswordHash);

      this.logger.log(`✅ Password cambiado exitosamente para usuario ID: ${userId}`, 'AuthService');
    } catch (error) {
      this.logger.error(
        `Error en cambio de password para ${userId}: ${error.message}`,
        error.stack,
        'AuthService'
      );
      throw error;
    }
  }

  async getServiceStatus() {
    try {
      const userCount = await this.userRepository.count();
      const isHealthy = await this.userRepository.healthCheck();
      
      return {
        service: 'AuthService',
        status: isHealthy ? 'healthy' : 'unhealthy',
        userCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo status del servicio: ${error.message}`, error.stack, 'AuthService');
      return {
        service: 'AuthService',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
