import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { SessionGuard } from '@/sessions/guards/session.guard.js';
import { UsersService } from '@/users/users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  @UseGuards(SessionGuard)
  async getMe(@Req() req: Request) {
    const user = await this.usersService.getUser(req.context.user!.id);
    return { success: true as const, data: user };
  }
}
