/**
 * Authentication models
 * Typed interfaces for JWT-based authentication
 * Synced with backend API: docs/AUTH_FRONTEND_GUIDE.md
 */

/**
 * User types returned by auth endpoints
 * Note: Backend returns uppercase values for auth responses
 */
export const AUTH_USER_TYPES = ['PROTAGONISTA', 'EDUCADOR', 'EXTERNA'] as const;
export type AuthUserType = (typeof AUTH_USER_TYPES)[number];

/**
 * Labels for AuthUserType (for UI display)
 */
export const AUTH_USER_TYPE_LABELS: Record<AuthUserType, string> = {
  PROTAGONISTA: 'Protagonista',
  EDUCADOR: 'Educador',
  EXTERNA: 'Persona Externa',
} as const;

/**
 * Authenticated user information
 * Returned by login, register, refresh, and getMe endpoints
 */
export interface AuthUser {
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
  readonly tipo: AuthUserType;
}

/**
 * Authentication response from login, register, and refresh endpoints
 */
export interface AuthResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AuthUser;
}

/**
 * Login request DTO
 * POST /auth/login
 */
export interface LoginDto {
  readonly email: string;
  readonly password: string;
}

/**
 * Register credentials request DTO
 * POST /auth/register
 * Note: Assigns credentials to an existing persona without credentials
 */
export interface RegisterDto {
  readonly personaId: string;
  readonly email: string;
  readonly password: string;
}

/**
 * Refresh token request DTO
 * POST /auth/refresh
 */
export interface RefreshTokenDto {
  readonly refreshToken: string;
}

/**
 * Logout request DTO
 * POST /auth/logout
 * Note: If refreshToken is omitted, ALL sessions are revoked
 */
export interface LogoutDto {
  readonly refreshToken?: string;
}

/**
 * Change password request DTO
 * PATCH /auth/password
 */
export interface ChangePasswordDto {
  readonly currentPassword: string;
  readonly newPassword: string;
}

/**
 * Decoded JWT payload structure
 * Used internally for token validation
 */
export interface JwtPayload {
  readonly sub: string; // User ID
  readonly email: string;
  readonly tipo: AuthUserType;
  readonly iat: number; // Issued at (Unix timestamp)
  readonly exp: number; // Expiration (Unix timestamp)
}

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
