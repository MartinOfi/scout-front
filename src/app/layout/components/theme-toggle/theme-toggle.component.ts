import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';

import { ThemeService } from '../../../core/services/theme.service';
import { THEME_MODE } from '../../../shared/constants/theme.constants';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'theme-toggle-host',
  },
})
export class ThemeToggleComponent {
  private readonly theme = inject(ThemeService);

  readonly isDark = computed(() => this.theme.mode() === THEME_MODE.Dark);

  onToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.theme.setMode(checked ? THEME_MODE.Dark : THEME_MODE.Light);
  }
}
