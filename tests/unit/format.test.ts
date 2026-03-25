import { describe, expect, it } from 'vitest';
import {
  formatPrice,
  formatRating,
  getInitials,
  slugify,
  truncateText,
} from '@/lib/format';

describe('format helpers', () => {
  it('formats prices in BRL', () => {
    expect(formatPrice(649.9)).toContain('649,90');
  });

  it('formats ratings with one decimal place', () => {
    expect(formatRating(4.86)).toBe('4.9');
  });

  it('slugifies text removing accents and punctuation', () => {
    expect(slugify('Bleu de Chanel Eau de Parfum!')).toBe('bleu-de-chanel-eau-de-parfum');
  });

  it('truncates text only when it exceeds the max length', () => {
    expect(truncateText('Perfume', 10)).toBe('Perfume');
    expect(truncateText('Perfume premium', 7)).toBe('Perfume...');
  });

  it('returns initials from a full name', () => {
    expect(getInitials('ELDE PARFUM')).toBe('EP');
  });
});
