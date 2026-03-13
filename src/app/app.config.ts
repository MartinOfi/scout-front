import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor, errorInterceptor } from './core/interceptors';
import { AuthStateService } from './modules/auth/services';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        authInterceptor, // Must be first - adds auth token
        errorInterceptor, // Handles errors globally
      ]),
    ),
    provideAnimationsAsync(),
    // Initialize auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
    },
  ],
};
