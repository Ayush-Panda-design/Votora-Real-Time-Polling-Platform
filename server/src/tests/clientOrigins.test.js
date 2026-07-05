import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getClientOrigins,
  isAllowedClientOrigin,
  isAllowedClientReferer,
  assertProductionClientConfig,
} from '../config/clientOrigins.js';

describe('clientOrigins', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('parses comma-separated CLIENT_URL values', () => {
    process.env.NODE_ENV = 'development';
    process.env.CLIENT_URL = 'https://app.vercel.app, https://preview.vercel.app/';

    expect(getClientOrigins()).toEqual([
      'https://app.vercel.app',
      'https://preview.vercel.app',
    ]);
    expect(isAllowedClientOrigin('https://preview.vercel.app')).toBe(true);
    expect(isAllowedClientOrigin('https://evil.example')).toBe(false);
  });

  it('allows referers that start with configured origins', () => {
    process.env.NODE_ENV = 'development';
    process.env.CLIENT_URL = 'https://app.vercel.app';

    expect(isAllowedClientReferer('https://app.vercel.app/login')).toBe(true);
    expect(isAllowedClientReferer('https://other.vercel.app/login')).toBe(false);
  });

  it('defaults to localhost only outside production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.CLIENT_URL;

    expect(getClientOrigins()).toEqual(['http://localhost:5173']);
  });

  it('requires CLIENT_URL in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CLIENT_URL;

    expect(getClientOrigins()).toEqual([]);
    expect(() => assertProductionClientConfig()).toThrow(/CLIENT_URL is required in production/);
  });
});
