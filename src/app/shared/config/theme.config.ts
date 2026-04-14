import { DEFAULT_THEME, type ThemeMode } from '../constants/theme.constants';

export interface ThemeConfig {
  readonly defaultMode: ThemeMode;
  readonly persistenceEnabled: boolean;
  readonly emitEvents: boolean;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultMode: DEFAULT_THEME,
  persistenceEnabled: true,
  emitEvents: false,
};
