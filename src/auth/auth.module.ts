import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@/auth/auth.controller.js';
import { AuthService } from '@/auth/auth.service.js';
import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';
import { SessionModule } from '@/sessions/session.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneVerification]), SessionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
