import { Controller, Get } from '@nestjs/common';

@Controller('board-test')
export class BoardTestController {
  @Get('simple')
  getSimple() {
    return {
      message: 'Controlador de prueba funcionando',
      timestamp: new Date().toISOString(),
      status: 'OK'
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'board-test'
    };
  }
}