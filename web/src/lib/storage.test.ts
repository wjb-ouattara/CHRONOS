import { afterEach, describe, expect, it, vi } from 'vitest';

import indexHtml from '../../index.html?raw';

import { readString, storageKeys, writeString } from './storage';

describe('storage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('écrit puis relit une valeur', () => {
    expect(writeString(storageKeys.theme, 'light')).toBe(true);
    expect(readString(storageKeys.theme)).toBe('light');
  });

  it('ne plante pas si localStorage lève une exception (navigation privée, quota…)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(readString(storageKeys.theme)).toBeNull();
    expect(writeString(storageKeys.theme, 'light')).toBe(false);
  });

  it('utilise la même clé de thème que le script inline de index.html', () => {
    // index.html lit le thème avant le démarrage de React (anti-flash) :
    // s'il utilisait une autre clé, le thème choisi serait ignoré au rechargement.
    expect(indexHtml).toContain(`'${storageKeys.theme}'`);
  });
});
