import { describe, expect, it } from 'vitest';

import { isTypingTarget, matchesShortcut } from './keyboard';

const make = (html: string) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.firstElementChild;
};

describe('isTypingTarget', () => {
  it.each([
    ['<input type="text">', true],
    ['<input type="search">', true],
    ['<textarea></textarea>', true],
    ['<select></select>', true],
    ['<input type="checkbox">', false],
    ['<button>ok</button>', false],
    ['<div></div>', false],
  ])('%s → %s', (html, expected) => {
    expect(isTypingTarget(make(html))).toBe(expected);
  });

  it('reconnaît une zone éditable', () => {
    const el = make('<div contenteditable="true"></div>') as HTMLElement;
    // jsdom ne calcule pas isContentEditable : on le simule.
    Object.defineProperty(el, 'isContentEditable', { value: true });
    expect(isTypingTarget(el)).toBe(true);
  });
});

describe('matchesShortcut', () => {
  it('accepte la touche seule, en minuscule ou majuscule', () => {
    expect(matchesShortcut(new KeyboardEvent('keydown', { key: 'y' }), 'y')).toBe(true);
    expect(matchesShortcut(new KeyboardEvent('keydown', { key: 'Y', shiftKey: true }), 'y')).toBe(
      true,
    );
  });

  it('refuse Ctrl, Alt et Cmd', () => {
    for (const mod of ['ctrlKey', 'altKey', 'metaKey'] as const) {
      expect(matchesShortcut(new KeyboardEvent('keydown', { key: 'r', [mod]: true }), 'r')).toBe(
        false,
      );
    }
  });
});
