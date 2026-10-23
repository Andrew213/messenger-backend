import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

import { Session } from '@/sessions/entities/session.entity.js';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly SessionRepository: Repository<Session>,
  ) {}
  async createSession(
    userId: string,
    manager?: EntityManager,
  ): Promise<{ token: string; expiresAt: Date; id: string }> {
    const repository = manager
      ? manager.getRepository(Session)
      : this.SessionRepository;
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

    const session = await repository.save(newSession);

    return { expiresAt, token: sessionToken, id: session.id };
  }
}
