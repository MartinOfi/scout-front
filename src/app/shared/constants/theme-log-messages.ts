export const THEME_LOG_MESSAGES = {
  StorageUnavailable: '[theme] localStorage is not available; falling back to in-memory preference.',
  InvalidStoredValue: '[theme] Ignoring invalid stored preference value.',
  WriteFailed: '[theme] Failed to persist theme preference.',
} as const;

export type ThemeLogMessageKey = keyof typeof THEME_LOG_MESSAGES;
