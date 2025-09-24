import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../común/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}
