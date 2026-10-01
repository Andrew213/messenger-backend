import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import appConfig from '@/config/app.config.js';

const { smsc } = appConfig();
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('testSms')
  async testSms() {
    const response = await fetch(`https://smsc.ru/rest/send/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: smsc.login,
        psw: smsc.pwd,
        apikey: smsc.apikey,
        phones: '+79680063203',
        mes: 'Вот твой отп код: 00123',
      }),
    });

    const data = await response.json();
    console.log(data);

    console.log({ data });
    return 'tested';
  }
}
