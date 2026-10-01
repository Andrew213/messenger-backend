import { PhoneVerification } from '@/auth/entities/phoneVerification.entity.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneVerification])],
  controllers: [],
  providers: [],
})
export class AuthModule {}
