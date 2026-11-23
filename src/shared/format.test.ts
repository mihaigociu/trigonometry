import { describe, expect, it } from 'vitest';
import { deg, num, signed } from './format';

describe('format', () => {
  it('uses a decimal comma in Romanian', () => {
    expect(num('ro', 0.5)).toBe('0,5');
    expect(num('en', 0.5)).toBe('0.5');
    expect(num('ro', 0.5, 3, true)).toBe('0,500');
  });

  it('uses a real minus and never prints −0', () => {
    expect(num('en', -0.25)).toBe('−0.25');
    expect(num('en', -0.0001)).toBe('0');
  });

  it('formats angles and signed terms', () => {
    expect(deg('ro', 37.5)).toBe('37,5°');
    expect(signed('en', -8)).toBe('− 8');
    expect(signed('en', 20)).toBe('+ 20');
  });

  it('prints infinity for tan 90°', () => {
    expect(num('en', Infinity)).toBe('∞');
  });
});
