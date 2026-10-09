import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createHash } from 'crypto';

import { Session } from '@/sessions/entities/session.entity.js';
import { SessionService } from '@/sessions/session.service.js';

describe('SessionService', () => {
  let service: SessionService;

  const mockServiceRepository = { save: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('возвращает токен и срок действия новой сессии', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const beforeCall = Date.now();

    const result = await service.createSession(userId);

    const expectedHash = createHash('sha256')
      .update(result.token)
      .digest('hex');

    expect(mockServiceRepository.save).toHaveBeenCalledWith({
      user: { id: userId },
      tokenHash: expectedHash,
      expiresAt: result.expiresAt,
    });

    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);

    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.expiresAt.getTime()).toBeGreaterThan(beforeCall);
  });
});
