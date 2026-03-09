/**
 * UI configuration constants
 */

export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  },
  DEBOUNCE_TIME: 300, // ms for search inputs
  SNACKBAR_DURATION: 3000, // ms
  DIALOG: {
    WIDTH: '500px',
    MAX_WIDTH: '90vw',
  },
  TABLE: {
    MIN_ROWS: 5,
    MAX_ROWS: 100,
  },
} as const;

/**
 * Date format constants
 */
export const DATE_FORMAT = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

/**
 * Currency format constants
 */
export const CURRENCY_CONFIG = {
  LOCALE: 'es-AR',
  CURRENCY: 'ARS',
  SYMBOL: '$',
  DECIMAL_PLACES: 2,
} as const;
