import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { API_CONFIG } from '../../shared/constants';

const KEEP_ALIVE_MS = 14 * 60 * 1000; // 14 minutes

/** Context token to mark keep-alive pings so interceptors can skip them. */
export const IS_KEEP_ALIVE = new HttpContextToken(() => false);

/**
 * Keeps the Render free-tier backend alive by pinging it
 * every 14 minutes after the last real API request.
 * Render hibernates free services after 15 min of inactivity.
 */
@Injectable({ providedIn: 'root' })
export class KeepAliveService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private timerId: ReturnType<typeof setTimeout> | null = null;

  /** Call after every outgoing API request to reset the timer. */
  notifyActivity(): void {
    this.schedulePing();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private schedulePing(): void {
    this.clearTimer();

    this.timerId = setTimeout(() => {
      const context = new HttpContext().set(IS_KEEP_ALIVE, true);
      this.http.get(API_CONFIG.BASE_URL, { responseType: 'text', context }).subscribe({
        next: () => this.schedulePing(),
        error: () => this.schedulePing(),
      });
    }, KEEP_ALIVE_MS);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
