import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [MembershipController],
  providers: [
    MembershipService,
  ],
  exports: [MembershipService],
})
export class MembershipModule {}
