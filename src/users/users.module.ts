import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionGuard } from '@/sessions/guards/session.guard.js';
import { SessionModule } from '@/sessions/session.module.js';
import { User } from '@/users/entities/user.entity.js';
import { UsersController } from '@/users/users.controller.js';
import { UsersService } from '@/users/users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SessionModule],
  controllers: [UsersController],
  providers: [UsersService, SessionGuard],
  exports: [UsersService],
})
export class UsersModule {}
