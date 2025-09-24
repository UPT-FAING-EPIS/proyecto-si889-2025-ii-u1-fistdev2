import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../común/logger.service';
import { PrismaService } from '../../común/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Repositorio de usuarios usando Prisma y PostgreSQL
 * Gestiona todas las operaciones de usuarios en la base de datos
 */
@Injectable()
export class UserRepository {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService
  ) {
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    try {
      // Verificar si el usuario admin ya existe
      const adminExists = await this.prisma.user.findUnique({
        where: { email: 'admin@devflow.com' }
      });

      if (!adminExists) {
        // Crear usuario admin por defecto
        const password = await bcrypt.hash('admin123', 12);
        await this.prisma.user.create({
          data: {
            email: 'admin@devflow.com',
            name: 'Administrador',
            password,
            roles: ['admin'],
          }
        });
        this.logger.log('👤 Usuario administrador creado por defecto', 'UserRepository');
      }
    } catch (error) {
      this.logger.error(`Error inicializando usuario admin: ${error.message}`, error.stack, 'UserRepository');
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });
      this.logger.debug(`Búsqueda usuario por email: ${email} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email (${email}): ${error.message}`, error.stack, 'UserRepository');
      throw error;
    }
  }

  async findByUsername(username: string) {
    try {
      // En el esquema actual no hay campo username, buscar por name
      const user = await this.prisma.user.findFirst({
        where: { name: username }
      });
      this.logger.debug(`Búsqueda usuario por name: ${username} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por name (${username}): ${error.message}`, error.stack, 'UserRepository');
      throw error;
    }
  }

  async findByIdentifier(identifier: string) {
    try {
      // Buscar por email o name (ya que no hay username en el esquema)
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { name: identifier }
          ]
        }
      });
      this.logger.debug(`Búsqueda usuario por identifier: ${identifier} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por identifier (${identifier}): ${error.message}`, error.stack, 'UserRepository');
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });
      this.logger.debug(`Búsqueda usuario por ID: ${id} - ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, 'UserRepository');
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por ID (${id}): ${error.message}`, error.stack, 'UserRepository');
      throw error;
    }
  }

  async create(userData: {
    email: string;
    name: string;
    password: string;
    roles?: string[];
  }) {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: userData.password,
          roles: userData.roles || ['user'],
        }
      });

      this.logger.log(`Usuario creado exitosamente: ${userData.email}`, 'UserRepository');
      return newUser;
    } catch (error) {
      this.logger.error(`Error al crear usuario (${userData.email}): ${error.message}`, error.stack, 'UserRepository');
      throw error;
    }
  }

  async updatePassword(userId: string, newPassword: string) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          password: newPassword,
        }
      });

      this.logger.log(`Contraseña actualizada para usuario: ${userId}`, 'UserRepository');
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error al actualizar contraseña (${userId}): ${error.message}`, error.stack, 'UserRepository');
      throw error;
    }
  }

  // Método desactivado - el esquema actual no tiene campo isActive
  // async deactivateUser(userId: string) {
  //   try {
  //     const updatedUser = await this.prisma.user.update({
  //       where: { id: userId },
  //       data: { 
  //         isActive: false,
  //       }
  //     });

  //     this.logger.log(`Usuario desactivado: ${userId}`, 'UserRepository');
  //     return updatedUser;
  //   } catch (error) {
  //     this.logger.error(`Error al desactivar usuario (${userId}): ${error.message}`, error.stack, 'UserRepository');
  //     throw error;
  //   }
  // }

  async count(): Promise<number> {
    try {
      return await this.prisma.user.count();
    } catch (error) {
      this.logger.error(`Error al contar usuarios: ${error.message}`, error.stack, 'UserRepository');
      return 0;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
          lastSeen: true,
          createdAt: true,
          updatedAt: true
        }
      });
      return users;
    } catch (error) {
      this.logger.error(`Error al obtener todos los usuarios: ${error.message}`, error.stack, 'UserRepository');
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Verificar que la conexión a Prisma esté funcionando
      await this.prisma.user.count();
      return true;
    } catch (error) {
      return false;
    }
  }
}
