import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Session } from '@/sessions/entities/session.entity.js';
import { SessionService } from '@/sessions/session.service.js';
import { UsersModule } from '@/users/users.module.js';
@Module({
  imports: [TypeOrmModule.forFeature([Session]), UsersModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
