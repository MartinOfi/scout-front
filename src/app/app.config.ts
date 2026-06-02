import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import {
  authInterceptor,
  errorInterceptor,
  keepAliveInterceptor,
  retryInterceptor,
} from './core/interceptors';
import { AuthStateService } from './modules/auth/services';
import { ThemeService } from './core/services/theme.service';

/**
 * Initialize authentication state on app startup
 * Restores user session from stored tokens if available
 */
function initializeAuth(): () => Promise<void> {
  const authState = inject(AuthStateService);

  return () =>
    firstValueFrom(authState.initializeFromStorage())
      .then(() => {
        // Auth state initialized successfully
      })
      .catch(() => {
        // Auth initialization failed - user will need to login
        // This is expected when tokens are invalid/expired
      });
}

/**
 * Force ThemeService construction before first render so the data-theme
 * attribute is synced with the stored preference.
 */
function initializeTheme(): () => void {
  const theme = inject(ThemeService);
  return () => {
    theme.mode();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        keepAliveInterceptor, // Resets keep-alive timer on every request
        authInterceptor, // Must be first auth-wise - adds auth token
        retryInterceptor, // Retries transient errors (502/503/504) with exponential backoff
        errorInterceptor, // Handles errors globally (only after retries exhausted)
      ]),
    ),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    // Initialize auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
    },
    // Initialize theme state on app startup (applies [data-theme] before first render)
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      multi: true,
    },
  ],
};
