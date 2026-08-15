import { describe, expect, it } from 'vitest';

import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_FORMAT,
  DEBOUNCE_DELAY,
  KEYBOARD_SHORTCUTS,
  SUPPORTED_FORMATS
} from './constants';

describe('constants', () => {
  it('exposes app metadata', () => {
    expect(APP_NAME).toBe('Mermaid GUI v2.0');
    expect(APP_VERSION).toBe('2.0.0');
  });

  it('defines supported formats', () => {
    expect(SUPPORTED_FORMATS).toEqual(['png', 'svg', 'pdf', 'jpg']);
    expect(DEFAULT_FORMAT).toBe('png');
  });

  it('defines timing defaults', () => {
    expect(DEBOUNCE_DELAY).toBe(500);
  });

  it('defines keyboard shortcuts', () => {
    expect(KEYBOARD_SHORTCUTS.NEW_FILE).toBe('Ctrl+N');
    expect(KEYBOARD_SHORTCUTS.SAVE_FILE).toBe('Ctrl+S');
  });
});
