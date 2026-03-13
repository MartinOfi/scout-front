import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../shared/constants';
import {
  AuthResponse,
  AuthUser,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  LogoutDto,
  ChangePasswordDto,
} from '../models';

/**
 * Authentication API service
 * Pure HTTP layer - no state management
 * All methods return Observables for the calling service to handle
 */
@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.BASE_URL;

  /**
   * Login with email and password
   * POST /auth/login
   *
   * @returns Access token, refresh token, and user info
   */
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/${API_CONFIG.ENDPOINTS.AUTH_LOGIN}`,
      credentials
    );
  }

  /**
   * Register credentials for an existing persona
   * POST /auth/register
   *
   * @param data Persona ID, email, and password
   * @returns Access token, refresh token, and user info
   */
  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/${API_CONFIG.ENDPOINTS.AUTH_REGISTER}`,
      data
    );
  }

  /**
   * Refresh tokens using current refresh token
   * POST /auth/refresh
   *
   * Note: After using a refresh token, it becomes invalid (token rotation)
   * Always store the new refresh token returned
   *
   * @param data Current refresh token
   * @returns New access token, new refresh token, and user info
   */
  refreshToken(data: RefreshTokenDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/${API_CONFIG.ENDPOINTS.AUTH_REFRESH}`,
      data
    );
  }

  /**
   * Logout and revoke refresh token
   * POST /auth/logout
   *
   * Note: If refreshToken is omitted, ALL sessions are revoked
   *
   * @param data Optional refresh token to revoke specific session
   * @returns void (204 No Content)
   */
  logout(data?: LogoutDto): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${API_CONFIG.ENDPOINTS.AUTH_LOGOUT}`,
      data ?? {}
    );
  }

  /**
   * Get current user profile
   * GET /auth/me
   *
   * @returns Current authenticated user info
   */
  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(
      `${this.baseUrl}/${API_CONFIG.ENDPOINTS.AUTH_ME}`
    );
  }

  /**
   * Change password
   * PATCH /auth/password
   *
   * Note: After changing password, ALL refresh tokens are invalidated
   * User must re-login on all devices
   *
   * @param data Current and new password
   * @returns void (204 No Content)
   */
  changePassword(data: ChangePasswordDto): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${API_CONFIG.ENDPOINTS.AUTH_PASSWORD}`,
      data
    );
  }
}
