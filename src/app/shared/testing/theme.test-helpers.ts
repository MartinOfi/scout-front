import { signal } from '@angular/core';
import {
  DEFAULT_THEME,
  type ThemeMode,
} from '../constants/theme.constants';

export interface MockThemeStorageOptions {
  readonly initial?: ThemeMode | null;
  readonly throwOnWrite?: boolean;
}

export interface MockThemeStorage {
  read: jasmine.Spy<() => ThemeMode | null>;
  write: jasmine.Spy<(mode: ThemeMode) => void>;
  clear: jasmine.Spy<() => void>;
}

export const createMockThemeStorage = (
  options: MockThemeStorageOptions = {},
): MockThemeStorage => {
  const state = signal<ThemeMode | null>(options.initial ?? null);

  return {
    read: jasmine.createSpy('read').and.callFake(() => state()),
    write: jasmine.createSpy('write').and.callFake((mode: ThemeMode) => {
      if (options.throwOnWrite) {
        throw new Error('mock write failure');
      }
      state.set(mode);
    }),
    clear: jasmine.createSpy('clear').and.callFake(() => state.set(null)),
  };
};

export interface MockThemeDom {
  applyTheme: jasmine.Spy<(mode: ThemeMode) => void>;
  appliedModes: ThemeMode[];
}

export const createMockThemeDom = (): MockThemeDom => {
  const appliedModes: ThemeMode[] = [];
  return {
    appliedModes,
    applyTheme: jasmine.createSpy('applyTheme').and.callFake((mode: ThemeMode) => {
      appliedModes.push(mode);
    }),
  };
};

export const DEFAULT_MOCK_MODE: ThemeMode = DEFAULT_THEME;
