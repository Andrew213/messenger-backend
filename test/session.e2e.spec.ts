import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { createHash, randomBytes } from 'crypto';
import { NextFunction, Request } from 'express';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { Repository } from 'typeorm';

import { Session } from '@/sessions/entities/session.entity.js';
import { SessionModule } from '@/sessions/session.module.js';
import { SessionService } from '@/sessions/session.service.js';
import { User } from '@/users/entities/user.entity.js';
import { UsersModule } from '@/users/users.module.js';

import { TestDB } from './config/typeorm-test.config.js';

describe('SessionGuard tests', () => {
  let app: INestApplication<App>;

  let repositoryUser: Repository<User>;
  let respositorySession: Repository<Session>;
  let serviceSession: SessionService;

  const mockToken = randomBytes(32).toString('base64');
  const mockPhone = '+70000000000';

  beforeAll(async () => {
    const refModule = await Test.createTestingModule({
      imports: [TestDB, UsersModule, SessionModule],
    }).compile();

    app = refModule.createNestApplication();

    repositoryUser = refModule.get(getRepositoryToken(User));
    respositorySession = refModule.get(getRepositoryToken(Session));
    serviceSession = refModule.get(SessionService);

    app.use((req: Request, _, next: NextFunction) => {
      req.context = {};
      next();
    });
    app.use(cookieParser());
    await app.init();
  });

  it('Should return user with valid session', async () => {
    const user = await repositoryUser.insert({
      phoneNumber: mockPhone,
    });
    const session = await serviceSession.createSession(
      user.generatedMaps[0].id,
    );

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Cookie', `token=${encodeURIComponent(session.token)}`)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        id: user.generatedMaps[0].id,
      },
    });
  });

  it('should return 401 when session expired', async () => {
    const user = await repositoryUser.insert({
      phoneNumber: mockPhone,
    });
    const expiresAt = new Date(Date.now() - 2 * 60 * 1000);
    const tokenHash = createHash('sha256').update(mockToken).digest('hex');

    await respositorySession.insert({
      expiresAt,
      user: {
        id: user.generatedMaps[0].id,
      },
      tokenHash,
    });

    await request(app.getHttpServer())
      .get('/users/me')
      .set('Cookie', `token=${encodeURIComponent(mockToken)}`)
      .expect(401);
  });

  it('should return 401 when no token in cookie', async () => {
    const user = await repositoryUser.insert({
      phoneNumber: mockPhone,
    });
    await serviceSession.createSession(user.generatedMaps[0].id);
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('should return 401 when no session of user', async () => {
    await repositoryUser.insert({
      phoneNumber: mockPhone,
    });

    await request(app.getHttpServer())
      .get('/users/me')
      .set('Cookie', `token=${encodeURIComponent(mockToken)}`)
      .expect(401);
  });

  afterEach(async () => {
    await repositoryUser.delete({ phoneNumber: mockPhone });
  });

  afterAll(async () => {
    await app?.close();
  });
});
