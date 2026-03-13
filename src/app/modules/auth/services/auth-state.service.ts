import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, map, catchError, finalize, switchMap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { AuthApiService } from './auth-api.service';
import { AuthUser, AuthResponse, LoginDto, RegisterDto, ChangePasswordDto } from '../models';

/**
 * Authentication state management service
 * Orchestrates auth flow and maintains reactive state
 * Single source of truth for authentication status
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly tokenService = inject(TokenService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  // ============================================================
  // State - Reactive (Signals + BehaviorSubject for compatibility)
  // ============================================================

  /** Current authenticated user (null when not authenticated) */
  private readonly _currentUser = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this._currentUser.asObservable();

  /** Signal-based current user for modern Angular components */
  readonly currentUser = signal<AuthUser | null>(null);

  /** Loading state for auth operations */
  readonly isLoading = signal(false);

  /** Computed: is user authenticated */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /** Observable version of isAuthenticated for guards and interceptors */
  readonly isAuthenticated$ = this.currentUser$.pipe(map(user => user !== null));

  // ============================================================
  // Refresh Token Management
  // ============================================================

  /** Flag to prevent multiple simultaneous refresh attempts */
  private isRefreshing = false;

  /** Promise for ongoing refresh operation (for request queuing) */
  private refreshPromise: Promise<AuthResponse> | null = null;

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize auth state from storage
   * Should be called on app startup (APP_INITIALIZER)
   */
  initializeFromStorage(): Observable<AuthUser | null> {
    // No tokens stored - not authenticated
    if (!this.tokenService.hasTokens()) {
      return of(null);
    }

    // Access token still valid - fetch user profile
    if (this.tokenService.isAccessTokenValid()) {
      return this.fetchAndSetUser();
    }

    // Access token expired but refresh token valid - refresh first
    if (this.tokenService.isRefreshTokenValid()) {
      return this.refreshSession().pipe(
        switchMap(() => this.fetchAndSetUser()),
        catchError(() => {
          this.clearAuthState();
          return of(null);
        })
      );
    }

    // Both tokens invalid - clear and return null
    this.clearAuthState();
    return of(null);
  }

  /**
   * Fetch current user profile and update state
   */
  private fetchAndSetUser(): Observable<AuthUser> {
    return this.authApi.getMe().pipe(
      tap(user => this.setUser(user)),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  // ============================================================
  // Authentication Operations
  // ============================================================

  /**
   * Login with email and password
   */
  login(credentials: LoginDto): Observable<AuthUser> {
    this.isLoading.set(true);

    return this.authApi.login(credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(response => response.user),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Register credentials for an existing persona
   */
  register(data: RegisterDto): Observable<AuthUser> {
    this.isLoading.set(true);

    return this.authApi.register(data).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(response => response.user),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Logout current session
   * @param revokeAllSessions If true, revokes all sessions (not just current)
   */
  logout(revokeAllSessions = false): void {
    const refreshToken = this.tokenService.getRefreshToken();

    // Call logout API (fire and forget - we clear state regardless)
    this.authApi.logout(
      revokeAllSessions ? undefined : { refreshToken: refreshToken ?? undefined }
    ).pipe(
      catchError(() => of(void 0)) // Ignore errors - clear state anyway
    ).subscribe();

    // Clear local state and redirect
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Change password (requires re-login after)
   */
  changePassword(data: ChangePasswordDto): Observable<void> {
    this.isLoading.set(true);

    return this.authApi.changePassword(data).pipe(
      tap(() => {
        // Password changed - all sessions invalidated
        // User must re-login
        this.clearAuthState();
        this.router.navigate(['/login']);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ============================================================
  // Token Refresh
  // ============================================================

  /**
   * Refresh the session using refresh token
   * Used by interceptor for transparent token refresh
   *
   * @returns Promise that resolves with new auth response
   */
  refreshSession(): Observable<AuthResponse> {
    // If already refreshing, return existing promise as observable
    if (this.isRefreshing && this.refreshPromise) {
      return new Observable(subscriber => {
        this.refreshPromise!
          .then(response => {
            subscriber.next(response);
            subscriber.complete();
          })
          .catch(error => subscriber.error(error));
      });
    }

    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing = true;

    // Create promise for queuing
    this.refreshPromise = new Promise((resolve, reject) => {
      this.authApi.refreshToken({ refreshToken }).pipe(
        tap(response => this.handleAuthResponse(response)),
        finalize(() => {
          this.isRefreshing = false;
          this.refreshPromise = null;
        })
      ).subscribe({
        next: response => resolve(response),
        error: error => {
          this.clearAuthState();
          reject(error);
        }
      });
    });

    return new Observable(subscriber => {
      this.refreshPromise!
        .then(response => {
          subscriber.next(response);
          subscriber.complete();
        })
        .catch(error => subscriber.error(error));
    });
  }

  /**
   * Check if a token refresh is currently in progress
   */
  isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  // ============================================================
  // State Management Helpers
  // ============================================================

  /**
   * Handle successful auth response (login, register, refresh)
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.setTokens(response.accessToken, response.refreshToken);
    this.setUser(response.user);
  }

  /**
   * Update user state (both signal and BehaviorSubject)
   */
  private setUser(user: AuthUser | null): void {
    this.currentUser.set(user);
    this._currentUser.next(user);
  }

  /**
   * Clear all auth state (tokens and user)
   */
  private clearAuthState(): void {
    this.tokenService.clearTokens();
    this.setUser(null);
  }

  // ============================================================
  // Public Accessors
  // ============================================================

  /**
   * Get current user synchronously
   * Prefer using currentUser signal or currentUser$ observable
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  /**
   * Check if user is authenticated synchronously
   */
  checkAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get current access token (for interceptor)
   */
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  /**
   * Check if access token needs refresh
   */
  needsTokenRefresh(): boolean {
    return this.tokenService.isAccessTokenExpiredOrExpiring();
  }
}
