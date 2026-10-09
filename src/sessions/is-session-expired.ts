export function isSessionExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt <= now;
}
