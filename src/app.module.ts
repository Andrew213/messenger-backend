import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import appConfig from './config/app.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/ormconfig.js';
import { UsersModule } from '@/users/users.module.js';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
