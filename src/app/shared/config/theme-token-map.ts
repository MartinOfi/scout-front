export const THEME_TOKENS = {
  surfacePage: '--surface-page',
  surfacePrimary: '--surface-primary',
  surfaceSecondary: '--surface-secondary',
  surfaceTertiary: '--surface-tertiary',
  surfaceElevated: '--surface-elevated',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textMuted: '--text-muted',
  borderLight: '--border-light',
  borderDefault: '--border-default',
  borderStrong: '--border-strong',
  shadowSm: '--shadow-sm',
  shadowMd: '--shadow-md',
  shadowLg: '--shadow-lg',
  hoverOverlay: '--hover-overlay',
  activeOverlay: '--active-overlay',
  focusRing: '--focus-ring',
} as const;

export type ThemeTokenKey = keyof typeof THEME_TOKENS;
export type ThemeTokenCssVar = typeof THEME_TOKENS[ThemeTokenKey];
