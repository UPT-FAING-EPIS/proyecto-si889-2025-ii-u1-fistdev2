import { Module, forwardRef } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardTestController } from './board-test.controller';
import { BoardService } from './board.service';
import { BoardRepositoryService } from './board-repository.service';
import { CollaborationModule } from '../collaboration/collaboration.module';
import { MembershipModule } from '../membership/membership.module';
import { CommonModule } from '../../común/common.module';
import { PrismaService } from '../../común/prisma.service';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => CollaborationModule),
    MembershipModule,
  ],
  controllers: [BoardController, BoardTestController],
  providers: [
    BoardService,
    PrismaService,
    // Usar el servicio de Prisma para consistencia
    {
      provide: 'IBoardService',
      useClass: BoardService,
    },
  ],
  exports: [BoardService, 'IBoardService'],
})
export class BoardModule {}