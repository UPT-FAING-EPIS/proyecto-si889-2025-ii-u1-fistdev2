import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollaborationGateway } from './collaboration.gateway';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [
    ConfigModule,
    MembershipModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-secret-key-change-in-production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CollaborationGateway,
  ],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}
