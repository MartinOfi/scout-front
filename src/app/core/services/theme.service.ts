import { Injectable, inject, signal } from '@angular/core';
import {
  THEME_MODE,
  type ThemeMode,
} from '../../shared/constants/theme.constants';
import { DEFAULT_THEME_CONFIG } from '../../shared/config/theme.config';
import { ThemeStorageService } from './theme-storage.service';
import { ThemeDomService } from './theme-dom.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(ThemeStorageService);
  private readonly dom = inject(ThemeDomService);

  readonly mode = signal<ThemeMode>(DEFAULT_THEME_CONFIG.defaultMode);

  constructor() {
    this.initialize();
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.dom.applyTheme(mode);
    this.storage.write(mode);
  }

  toggle(): void {
    const next =
      this.mode() === THEME_MODE.Light ? THEME_MODE.Dark : THEME_MODE.Light;
    this.setMode(next);
  }

  private initialize(): void {
    const stored = this.storage.read();
    const initial = stored !== null ? stored : DEFAULT_THEME_CONFIG.defaultMode;
    this.mode.set(initial);
    this.dom.applyTheme(initial);
  }
}
