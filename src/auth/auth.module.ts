import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@/auth/auth.controller.js';
import { AuthService } from '@/auth/auth.service.js';
import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneVerification])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
