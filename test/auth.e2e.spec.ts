import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DeepPartial, Repository } from 'typeorm';

import { AuthModule } from '@/auth/auth.module.js';
import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';
import appConfig from '@/config/app.config.js';
import { User } from '@/users/entities/user.entity.js';

import { TestDB } from './config/typeorm-test.config.js';

const { smsru } = appConfig();

describe('Auth e2e test', () => {
  let app: INestApplication<App>;
  const mockedCode = '1234';
  const mockedNumber = '+79999999993';
  const otpHash = createHmac('sha256', smsru.otpSecret)
    .update(`${mockedNumber}:${mockedCode}`)
    .digest('hex');
  let repositoryPhoneVerification: Repository<PhoneVerification>;
  let repositoryUser: Repository<User>;

  const fakeFetch = vi.fn();

  beforeEach(async () => {
    fakeFetch.mockReset();
    await repositoryPhoneVerification.delete({ phoneNumber: mockedNumber });

    fakeFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          status: 'OK',
          code: mockedCode,
        }),
      ok: true,
    });

    vi.stubGlobal('fetch', fakeFetch);
  });

  beforeAll(async () => {
    const refModule = await Test.createTestingModule({
      imports: [TestDB, AuthModule],
    }).compile();

    app = refModule.createNestApplication();

    repositoryPhoneVerification = refModule.get(
      getRepositoryToken(PhoneVerification),
    );

    repositoryUser = refModule.get(getRepositoryToken(User));

    await app.init();
  });

  it('POST /auth/call should create OTP in phone verification', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/call')
      .send({ phoneNumber: mockedNumber })
      .expect(201);

    const phoneVerification = await repositoryPhoneVerification.findOneByOrFail(
      { phoneNumber: mockedNumber },
    );

    const expectedBuffer = Buffer.from(otpHash, 'hex');
    const receivedBuffer = Buffer.from(phoneVerification.otpHash, 'hex');

    expect(receivedBuffer).toHaveLength(expectedBuffer.length);
    expect(timingSafeEqual(expectedBuffer, receivedBuffer)).toBe(true);
    expect(response.body).toEqual({
      success: true,
      data: {
        blockedUntil: null,
        expiresAt: expect.any(String),
        failedAttempts: 0,
        resendAvailableAt: expect.any(String),
      },
    });
  });

  it('POST /auth/code should set token in cookie', async () => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const mockedValues: DeepPartial<PhoneVerification> = {
      phoneNumber: mockedNumber,
      failedAttempts: 0,
      blockedUntil: null,
      otpHash,
      resendAvailableAt: expiresAt,
      expiresAt,
      consumedAt: null,
    };
    await repositoryPhoneVerification.insert(mockedValues);

    const response = await request(app.getHttpServer())
      .post('/auth/code')
      .send({ phoneNumber: mockedNumber, code: mockedCode })
      .expect(200);

    expect(response.headers['set-cookie']).toBeDefined();

    const cookies = response.headers['set-cookie'] as unknown as string[];

    const token = cookies.find((el) => el.startsWith('token='));

    expect(token).toBeDefined();
    expect(token).toContain('HttpOnly');
    expect(token).toContain('Secure');
    expect(token).toContain('SameSite=Strict');
    expect(response.body).not.toHaveProperty(['data', 'token']);
  });

  afterEach(async () => {
    await repositoryUser.delete({ phoneNumber: mockedNumber });
    await repositoryPhoneVerification.delete({ phoneNumber: mockedNumber });
  });
  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
