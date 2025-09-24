import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './modules/dashboard/app.controller';
import { AppService } from './modules/dashboard/app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/projects/project.module';
import { BoardModule } from './modules/boards/board.module';
import { MembershipModule } from './modules/membership/membership.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { CommonModule } from './común/common.module';

/**
 * Módulo principal de la aplicación DevFlow
 * Centraliza la configuración global y los módulos principales
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    CommonModule,
    AuthModule,
    ProjectModule,
    BoardModule,
    MembershipModule,
    CollaborationModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
