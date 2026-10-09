import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DeepPartial, Repository } from 'typeorm';

import { Session } from '@/sessions/entities/session.entity.js';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly SessionRepository: Repository<Session>,
  ) {}
  async createSession(
    userId: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const sessionToken = randomBytes(32).toString('base64');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newSession: DeepPartial<Session> = {
      expiresAt,
      user: {
        id: userId,
      },
      tokenHash,
    };

    await this.SessionRepository.save(newSession);

    return { expiresAt, token: sessionToken };
  }
}
