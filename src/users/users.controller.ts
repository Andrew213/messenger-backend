import { Controller, Get, Req, Request } from '@nestjs/common';

import { UsersService } from '@/users/users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('hello')
  async getUser(@Req() req: Request) {
    return 'hello motherfucker';
  }
}
