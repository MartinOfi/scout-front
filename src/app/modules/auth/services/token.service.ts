import { Injectable } from '@angular/core';
import { JwtPayload, TOKEN_KEYS } from '../models';

/**
 * Token management service
 * Handles storage, retrieval, validation, and decoding of JWT tokens
 * Uses localStorage with abstraction for future upgrade to secure storage
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  /**
   * Buffer time in seconds before token expiration
   * Used to refresh tokens before they actually expire
   */
  private readonly EXPIRATION_BUFFER_SECONDS = 60;

  // ============================================================
  // Storage Operations
  // ============================================================

  /**
   * Store access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Store access token
   */
  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all tokens from storage
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if tokens exist in storage
   */
  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }

  // ============================================================
  // Token Validation
  // ============================================================

  /**
   * Check if access token is valid and not expired
   */
  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    return !this.isTokenExpired(payload);
  }

  /**
   * Check if access token is expired or about to expire
   * Uses buffer to trigger refresh before actual expiration
   */
  isAccessTokenExpiredOrExpiring(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = this.decodeToken(token);
    if (!payload) return true;

    return this.isTokenExpired(payload, this.EXPIRATION_BUFFER_SECONDS);
  }

  /**
   * Check if refresh token is valid (not expired)
   */
  isRefreshTokenValid(): boolean {
    const token = this.getRefreshToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    return !this.isTokenExpired(payload);
  }

  /**
   * Check if a token payload is expired
   * @param payload Decoded JWT payload
   * @param bufferSeconds Additional buffer time in seconds
   */
  private isTokenExpired(payload: JwtPayload, bufferSeconds = 0): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + bufferSeconds;
  }

  // ============================================================
  // Token Decoding
  // ============================================================

  /**
   * Decode a JWT token and return the payload
   * Returns null if token is invalid or malformed
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = this.base64UrlDecode(payload);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Get decoded payload from stored access token
   */
  getAccessTokenPayload(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  /**
   * Decode base64url encoded string
   * JWT uses base64url encoding (different from standard base64)
   */
  private base64UrlDecode(str: string): string {
    // Replace URL-safe characters with standard base64 characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Pad with '=' to make length a multiple of 4
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    return atob(base64);
  }

  // ============================================================
  // User Information
  // ============================================================

  /**
   * Get user ID from stored access token
   */
  getUserId(): string | null {
    const payload = this.getAccessTokenPayload();
    return payload?.sub ?? null;
  }

  /**
   * Get user email from stored access token
   */
  getUserEmail(): string | null {
    const payload = this.getAccessTokenPayload();
    return payload?.email ?? null;
  }

  /**
   * Get token expiration time in seconds from now
   * Returns 0 if token is expired or invalid
   */
  getAccessTokenRemainingTime(): number {
    const payload = this.getAccessTokenPayload();
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = payload.exp - currentTime;
    return remaining > 0 ? remaining : 0;
  }
}
