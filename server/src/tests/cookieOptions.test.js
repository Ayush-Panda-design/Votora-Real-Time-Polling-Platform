import { describe, it, expect, afterEach, vi } from 'vitest';

describe('auth cookie options', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('uses SameSite=None with Secure in production', async () => {
    process.env.NODE_ENV = 'production';
    const { COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } = await import('../constants/index.js');

    expect(COOKIE_OPTIONS.sameSite).toBe('none');
    expect(COOKIE_OPTIONS.secure).toBe(true);
    expect(COOKIE_OPTIONS.path).toBe('/');
    expect(REFRESH_COOKIE_OPTIONS.sameSite).toBe('none');
    expect(REFRESH_COOKIE_OPTIONS.secure).toBe(true);
  });

  it('uses lax cookies without Secure requirement in development', async () => {
    process.env.NODE_ENV = 'development';
    const { COOKIE_OPTIONS } = await import('../constants/index.js');

    expect(COOKIE_OPTIONS.sameSite).toBe('lax');
    expect(COOKIE_OPTIONS.secure).toBe(false);
  });
});
