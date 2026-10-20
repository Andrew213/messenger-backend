import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { DeepPartial, Repository } from 'typeorm';

import { AuthModule } from '@/auth/auth.module.js';
import { AuthService } from '@/auth/auth.service.js';
import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';
import {
  AUTH_ERROR_DEFINITIONS,
  AuthErrorCode,
} from '@/auth/errors/auth.errors.js';
import { AppException } from '@/common/exceptions/app.exceptions.js';
import {
  ERROR_DEFINITIONS,
  ErrorCode,
} from '@/common/exceptions/error-codes.js';
import appConfig from '@/config/app.config.js';

import { TestDB } from '../../test/config/typeorm-test.config.js';

const { smsru } = appConfig();

describe('authService testing', () => {
  let moduleRef: TestingModule;
  let repository: Repository<PhoneVerification>;
  let service: AuthService;
  const fakeFetch = vi.fn();

  const mockedCode = '1234';
  const mockedNumber = '+79999999993';
  const otpHash = createHmac('sha256', smsru.otpSecret)
    .update(`${mockedNumber}:${mockedCode}`)
    .digest('hex');

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TestDB, AuthModule],
    }).compile();
    service = moduleRef.get<AuthService>(AuthService);
    repository = moduleRef.get(getRepositoryToken(PhoneVerification));
  });

  beforeEach(async () => {
    fakeFetch.mockReset();
    await repository.delete({ phoneNumber: mockedNumber });

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

  describe('sendCall()', () => {
    it('should create phone verification for new phone number', async () => {
      await service.sendCall(mockedNumber);

      const row = await repository.findOneByOrFail({
        phoneNumber: mockedNumber,
      });
      expect(row?.phoneNumber).toBe(mockedNumber);
    });

    it('should check SUCCESS returning value', async () => {
      const dateBeforeCall = Date.now();
      const response = await service.sendCall(mockedNumber);
      const dateAfterCall = Date.now();
      const twoMin = 2 * 60 * 1000;
      const minExpiresAt = dateBeforeCall + twoMin;
      const maxExpiresAt = dateAfterCall + twoMin;
      const row = await repository.findOneByOrFail({
        phoneNumber: mockedNumber,
      });

      expect(row.expiresAt.getTime()).toBeGreaterThanOrEqual(minExpiresAt);
      expect(row.expiresAt.getTime()).toBeLessThanOrEqual(maxExpiresAt);
      expect(otpHash).toBe(row.otpHash);
      expect(response).toEqual({
        success: true,
        data: {
          blockedUntil: null,
          expiresAt: expect.any(Date),
          failedAttempts: 0,
          resendAvailableAt: expect.any(Date),
        },
      });
    });

    it('should fail due to blockedUntil on existing phone number', async () => {
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
      const mockedValues: DeepPartial<PhoneVerification> = {
        phoneNumber: mockedNumber,
        failedAttempts: 0,
        blockedUntil: new Date(Date.now() + 60 * 1000),
        otpHash,
        resendAvailableAt: expiresAt,
        expiresAt,
        consumedAt: null,
      };
      await repository.insert(mockedValues);

      const promise = service.sendCall(mockedNumber);

      await expect(promise).rejects.toBeInstanceOf(AppException);
      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpAttemptsExceeded,
        message:
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpAttemptsExceeded].message,
      });
      expect(fakeFetch).not.toHaveBeenCalled();
    });

    it('should fail due to cooldown on existing phone number', async () => {
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
      await repository.insert(mockedValues);

      const promise = service.sendCall(mockedNumber);

      await expect(promise).rejects.toBeInstanceOf(AppException);
      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpResendTooSoon,
        message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpResendTooSoon].message,
      });
      expect(fakeFetch).not.toHaveBeenCalled();
    });

    it('should resend OTP when cooldown has expired', async () => {
      const expiresAt = new Date(Date.now() - 2 * 60 * 1000);
      const oldOTPHash = createHmac('sha256', smsru.otpSecret)
        .update(`${mockedNumber}:1111`)
        .digest('hex');
      const mockedValues: DeepPartial<PhoneVerification> = {
        phoneNumber: mockedNumber,
        failedAttempts: 2,
        blockedUntil: expiresAt,
        otpHash: oldOTPHash,
        resendAvailableAt: new Date(Date.now() - 60 * 1000),
        expiresAt,
        consumedAt: expiresAt,
      };
      await repository.insert(mockedValues);

      const rowBefore = await repository.findOneByOrFail({
        phoneNumber: mockedNumber,
      });

      const response = await service.sendCall(mockedNumber);

      const rowAfter = await repository.findOneByOrFail({
        phoneNumber: mockedNumber,
      });

      expect(rowBefore.otpHash).not.toBe(rowAfter.otpHash);
      expect(rowBefore.expiresAt.getTime()).not.toBe(
        rowAfter.expiresAt.getTime(),
      );
      expect(rowBefore.resendAvailableAt?.getTime()).not.toBe(
        rowAfter.resendAvailableAt?.getTime(),
      );

      expect(rowAfter.failedAttempts).toBe(0);
      expect(rowAfter.otpHash).toBe(otpHash);
      expect(rowAfter.blockedUntil).toBeNull();
      expect(rowAfter.consumedAt).toBeNull();

      expect(response).toEqual({
        success: true,
        data: {
          blockedUntil: null,
          expiresAt: expect.any(Date),
          failedAttempts: 0,
          resendAvailableAt: expect.any(Date),
        },
      });
    });

    it('should fail if smsru has failed', async () => {
      fakeFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const promise = service.sendCall(mockedNumber);
      await expect(promise).rejects.instanceOf(AppException);
      await expect(promise).rejects.toMatchObject({
        code: ErrorCode.ServiceUnavailable,
        message: ERROR_DEFINITIONS[ErrorCode.ServiceUnavailable].message,
      });

      const exists = await repository.existsBy({
        phoneNumber: mockedNumber,
      });

      expect(exists).toBe(false);
    });

    it('should reject when smsru json has failed', async () => {
      fakeFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'not ok',
          }),
      });
      const promise = service.sendCall(mockedNumber);

      await expect(promise).rejects.instanceOf(AppException);
      await expect(promise).rejects.toMatchObject({
        code: ErrorCode.ServiceUnavailable,
        message: ERROR_DEFINITIONS[ErrorCode.ServiceUnavailable].message,
      });
      const exist = await repository.existsBy({
        phoneNumber: mockedNumber,
      });
      expect(exist).toBe(false);
    });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    await repository.delete({ phoneNumber: mockedNumber });
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
