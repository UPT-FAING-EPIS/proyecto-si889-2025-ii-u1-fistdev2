import { Module, forwardRef } from '@nestjs/common';
import { ProjectService } from './project.service';
import { BoardService } from '../boards/board.service';
import { ProjectController } from './project.controller';
import { CollaborationModule } from '../collaboration/collaboration.module';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [
    forwardRef(() => CollaborationModule),
    MembershipModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService, 
    BoardService,
  ],
  exports: [ProjectService, BoardService]
})
export class ProjectModule {}
