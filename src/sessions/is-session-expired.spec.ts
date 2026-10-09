import { expect, it } from 'vitest';

import { isSessionExpired } from '@/sessions/is-session-expired.js';

it('считает сессию истёкшей, если срок уже прошёл', () => {
  const expiresAt = new Date('2026-10-08T12:00:00Z');
  const now = new Date('2026-10-08T12:01:00Z');

  expect(isSessionExpired(expiresAt, now)).toBe(true);
});

it('считает сессию истёкшей в момент окончания срока', () => {
  const expiresAt = new Date('2026-10-08T12:00:00Z');
  const now = new Date('2026-10-08T12:00:00Z');

  expect(isSessionExpired(expiresAt, now)).toBe(true);
});

it('считает сессию действительной пока срок не наступил', () => {
  const expiresAt = new Date('2026-10-08T12:20:00Z');
  const now = new Date('2026-10-08T12:00:00Z');

  expect(isSessionExpired(expiresAt, now)).toBe(false);
});
