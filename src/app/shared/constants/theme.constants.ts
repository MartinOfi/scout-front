export const THEME_MODE = {
  Light: 'light',
  Dark: 'dark',
} as const;

export type ThemeMode = typeof THEME_MODE[keyof typeof THEME_MODE];

export const THEME_STORAGE_KEY = 'scout-theme-preference';
export const THEME_DOM_ATTRIBUTE = 'data-theme';
export const DEFAULT_THEME: ThemeMode = THEME_MODE.Light;

export const ALL_THEME_MODES: readonly ThemeMode[] = [
  THEME_MODE.Light,
  THEME_MODE.Dark,
] as const;

export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && (ALL_THEME_MODES as readonly string[]).includes(value);
