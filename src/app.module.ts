import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth/auth.module.js';
import { AppExceptionFilter } from '@/filters/app-exception.filter.js';
import { UsersModule } from '@/users/users.module.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import appConfig from './config/app.config.js';
import { dataSourceOptions } from './database/ormconfig.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const {
  app: { Observe },
} = appConfig();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: Observe.appKey || '',
      appSecret: Observe.appSecret || '',
      serviceId: 'messenger-backend',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
