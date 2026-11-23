import { describe, expect, it } from 'vitest';
import ro from './ro.json';
import en from './en.json';
import { localePath, pickLocale, t, withBase } from '.';
import { LABS } from '../shared/labs';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('translations', () => {
  it('English and Romanian have exactly the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(ro).sort());
  });

  it('has no empty strings', () => {
    for (const dict of [ro, en]) {
      for (const key of keys(dict)) expect(t(dict === ro ? 'ro' : 'en', key as never)).not.toBe('');
    }
  });

  it('has a title, blurb and lead for every lab', () => {
    for (const lab of LABS) {
      for (const dict of [ro, en]) {
        expect(dict.labs).toHaveProperty(`${lab.id}.title`);
        expect(dict.labs).toHaveProperty(`${lab.id}.blurb`);
        expect(dict.labs).toHaveProperty(`${lab.id}.lead`);
      }
    }
  });
});

describe('pickLocale', () => {
  it('takes the first supported browser language', () => {
    expect(pickLocale(['en-GB', 'ro'])).toBe('en');
    expect(pickLocale(['de-DE', 'ro-RO', 'en'])).toBe('ro');
  });

  it('falls back to Romanian', () => {
    expect(pickLocale(['fr-FR'])).toBe('ro');
    expect(pickLocale([])).toBe('ro');
  });
});

describe('withBase / localePath', () => {
  const base = '/trigonometry/';

  it('adds trailing slashes to pages but not to files', () => {
    expect(withBase('', base)).toBe('/trigonometry/');
    expect(withBase('/en', base)).toBe('/trigonometry/en/');
    expect(withBase('favicon.svg', base)).toBe('/trigonometry/favicon.svg');
  });

  it('keeps query strings after the slash', () => {
    expect(localePath('en', 'waves?level=2', base)).toBe('/trigonometry/en/waves/?level=2');
  });

  it('works with a base that has no trailing slash', () => {
    expect(localePath('ro', 'ratios', '/trigonometry')).toBe('/trigonometry/ro/ratios/');
  });
});
