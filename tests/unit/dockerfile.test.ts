import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Dockerfile', () => {
  const dockerfile = readFileSync('Dockerfile', 'utf-8');

  it('expoe um healthcheck para o container', () => {
    expect(dockerfile).toContain('HEALTHCHECK');
    expect(dockerfile).toContain('http://127.0.0.1:3000/');
  });
});
