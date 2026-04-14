import { Injectable, inject } from '@angular/core';
import {
  THEME_STORAGE_KEY,
  isThemeMode,
  type ThemeMode,
} from '../../shared/constants/theme.constants';
import { ThemeLoggerService } from './theme-logger.service';

@Injectable({ providedIn: 'root' })
export class ThemeStorageService {
  private readonly logger = inject(ThemeLoggerService);
  private memoryFallback: ThemeMode | null = null;

  read(): ThemeMode | null {
    const raw = this.safeGet();
    if (raw === null) {
      return this.memoryFallback;
    }
    if (!isThemeMode(raw)) {
      this.logger.warn('InvalidStoredValue');
      return null;
    }
    return raw;
  }

  write(mode: ThemeMode): void {
    this.memoryFallback = mode;
    this.safeSet(mode);
  }

  clear(): void {
    this.memoryFallback = null;
    this.safeRemove();
  }

  private safeGet(): string | null {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      this.logger.warn('StorageUnavailable');
      return null;
    }
  }

  private safeSet(mode: ThemeMode): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      this.logger.warn('WriteFailed');
    }
  }

  private safeRemove(): void {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      this.logger.warn('WriteFailed');
    }
  }
}
