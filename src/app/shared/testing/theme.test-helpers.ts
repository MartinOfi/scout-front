import { signal } from '@angular/core';
import { vi } from 'vitest';
import { DEFAULT_THEME, type ThemeMode } from '../constants/theme.constants';

export interface MockThemeStorageOptions {
  readonly initial?: ThemeMode | null;
  readonly throwOnWrite?: boolean;
}

export interface MockThemeStorage {
  read: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

export const createMockThemeStorage = (
  options: MockThemeStorageOptions = {},
): MockThemeStorage => {
  const state = signal<ThemeMode | null>(options.initial ?? null);

  return {
    read: vi.fn(() => state()),
    write: vi.fn((mode: ThemeMode) => {
      if (options.throwOnWrite) {
        throw new Error('mock write failure');
      }
      state.set(mode);
    }),
    clear: vi.fn(() => state.set(null)),
  };
};

export interface MockThemeDom {
  applyTheme: ReturnType<typeof vi.fn>;
  appliedModes: ThemeMode[];
}

export const createMockThemeDom = (): MockThemeDom => {
  const appliedModes: ThemeMode[] = [];
  return {
    appliedModes,
    applyTheme: vi.fn((mode: ThemeMode) => {
      appliedModes.push(mode);
    }),
  };
};

export const DEFAULT_MOCK_MODE: ThemeMode = DEFAULT_THEME;
