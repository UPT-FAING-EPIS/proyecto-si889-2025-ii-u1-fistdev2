import { Controller, Get, Param } from '@nestjs/common';

@Controller('boards')
export class BoardController {
  @Get('test')
  async test() {
    return {
      success: true,
      message: 'BoardController funcionando correctamente',
      timestamp: new Date()
    };
  }

  @Get('project/:projectId')
  async getBoardByProject(@Param('projectId') projectId: string) {
    return {
      success: true,
      data: {
        id: 'test-board',
        projectId: projectId,
        name: 'Tablero Test',
        description: 'Tablero de prueba',
        columns: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user'
      },
      message: 'Tablero obtenido exitosamente'
    };
  }
}