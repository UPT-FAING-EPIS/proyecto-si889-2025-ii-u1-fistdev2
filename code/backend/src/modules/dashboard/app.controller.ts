import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controlador principal de la aplicación
 * Maneja endpoints básicos de status y salud
 */
@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener información básica de la aplicación' })
  @ApiResponse({ status: 200, description: 'Información de la aplicación retornada exitosamente' })
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check de la aplicación' })
  @ApiResponse({ status: 200, description: 'Estado de salud de la aplicación' })
  getHealth() {
    return this.appService.getHealthStatus();
  }

  @Get('version')
  @ApiOperation({ summary: 'Obtener versión de la aplicación' })
  @ApiResponse({ status: 200, description: 'Versión de la aplicación' })
  getVersion() {
    return this.appService.getVersion();
  }
}
