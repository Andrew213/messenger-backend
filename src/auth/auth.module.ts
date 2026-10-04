import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhoneVerification } from '@/auth/entities/phoneVerification.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneVerification])],
  controllers: [],
  providers: [],
})
export class AuthModule {}
