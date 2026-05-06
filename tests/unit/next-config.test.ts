import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

describe('nextConfig', () => {
  it('gera build standalone para uso em container', () => {
    expect(nextConfig.output).toBe('standalone');
  });
});
