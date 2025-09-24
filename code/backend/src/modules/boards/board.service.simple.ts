import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardService {
  async getBoardByProjectId(projectId: string) {
    return {
      id: 'test-board',
      projectId: projectId,
      name: 'Tablero Test',
      description: 'Tablero de prueba',
      columns: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-user'
    };
  }

  async checkMemberPermission(projectId: string, userId: string, role?: string) {
    return true; // Permitir todo por ahora para testing
  }

  async addProjectMember(memberData: any) {
    return {
      id: 'test-member',
      ...memberData,
      joinedAt: new Date()
    };
  }
}