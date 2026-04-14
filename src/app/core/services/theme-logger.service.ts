import { Injectable } from '@angular/core';
import {
  THEME_LOG_MESSAGES,
  type ThemeLogMessageKey,
} from '../../shared/constants/theme-log-messages';

@Injectable({ providedIn: 'root' })
export class ThemeLoggerService {
  private readonly warnedKeys = new Set<ThemeLogMessageKey>();

  warn(key: ThemeLogMessageKey): void {
    if (this.warnedKeys.has(key)) {
      return;
    }
    this.warnedKeys.add(key);
    console.warn(THEME_LOG_MESSAGES[key]);
  }
}
