import { User } from '@/users/entities/user.entity.js';
import { UsersController } from '@/users/users.controller.js';
import { UsersService } from '@/users/users.service.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
