import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('compose.yaml', () => {
  const compose = readFileSync('compose.yaml', 'utf-8');

  it('usa um arquivo de ambiente dedicado para o fluxo Docker', () => {
    expect(compose).toContain('.env.docker');
  });

  it('mantem a porta 3000 exposta para a aplicacao', () => {
    expect(compose).toContain('3000:3000');
  });
});
