import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';

import { SessionService } from '@/sessions/session.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpRequest = context.switchToHttp().getRequest<Request>();
    console.log({ httpRequest });
    const token = httpRequest.cookies['token'];
    if (token) {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const { userId, sessionId } =
        await this.sessionService.checkSession(tokenHash);
      httpRequest.context.user = { id: userId };
      httpRequest.context.sessionId = sessionId;
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
