import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';

import { Session } from '@/sessions/entities/session.entity.js';
import { SessionModule } from '@/sessions/session.module.js';
import { SessionService } from '@/sessions/session.service.js';
import { User } from '@/users/entities/user.entity.js';
import { UsersModule } from '@/users/users.module.js';
import { UsersService } from '@/users/users.service.js';

import { TestDB } from '../../test/config/typeorm-test.config.js';

describe('SessionService integration test', () => {
  let repository: Repository<Session>;
  let repositoryUser: Repository<User>;
  let service: SessionService;
  let moduleRef: TestingModule;
  let usersService: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TestDB, SessionModule, UsersModule],
    }).compile();

    repository = moduleRef.get<Repository<Session>>(
      getRepositoryToken(Session),
    );
    repositoryUser = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    service = moduleRef.get<SessionService>(SessionService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });
  it('should create a new session', async () => {
    let userId: string | undefined;
    try {
      userId = await usersService.createUser('+79680063203');

      const dateBeforeCall = Date.now();

      const session = await service.createSession(userId);

      const afterCall = Date.now();

      const tokenHash = createHash('sha256')
        .update(session.token)
        .digest('hex');

      const createdSession = await repository.findOneOrFail({
        where: { id: session.id },
        relations: { user: true },
      });

      const DAY = 24 * 60 * 60 * 1000;
      const minExpiresAt = dateBeforeCall + DAY;
      const maxExpiresAt = afterCall + DAY;

      expect(createdSession.expiresAt.getTime()).toBeGreaterThanOrEqual(
        minExpiresAt,
      );
      expect(createdSession.expiresAt.getTime()).toBeLessThanOrEqual(
        maxExpiresAt,
      );

      expect(createdSession.tokenHash).toBe(tokenHash);

      expect(createdSession.user.id).toBe(userId);

      expect(createdSession.expiresAt.getTime()).toBe(
        session.expiresAt.getTime(),
      );

      expect(createdSession).toMatchObject({
        expiresAt: expect.any(Date),
        tokenHash: expect.any(String),
        id: expect.any(String),
      });
    } finally {
      if (userId) {
        await repositoryUser.delete(userId);
      }
    }
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
