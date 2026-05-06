import { describe, expect, it } from 'vitest';
import { dynamic as homeDynamic } from '@/app/page';
import { dynamic as catalogDynamic } from '@/app/catalogo/page';
import { dynamic as productDynamic } from '@/app/p/[slug]/page';

describe('server pages backed by Supabase', () => {
  it('forca runtime rendering para evitar fetch no build', () => {
    expect(homeDynamic).toBe('force-dynamic');
    expect(catalogDynamic).toBe('force-dynamic');
    expect(productDynamic).toBe('force-dynamic');
  });
});
