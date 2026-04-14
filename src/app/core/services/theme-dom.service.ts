import { Injectable } from '@angular/core';
import {
  THEME_DOM_ATTRIBUTE,
  type ThemeMode,
} from '../../shared/constants/theme.constants';

@Injectable({ providedIn: 'root' })
export class ThemeDomService {
  applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute(THEME_DOM_ATTRIBUTE, mode);
  }
}
