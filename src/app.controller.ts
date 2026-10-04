import { Controller, Get } from '@nestjs/common';

import appConfig from '@/config/app.config.js';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
