/**
 * Button Component
 * Reusable button with multiple variants, sizes, and states.
 * Features a subtle shimmer effect on primary buttons for CTAs.
 */

import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  // Inputs
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly icon = input<string | null>(null);
  readonly iconPosition = input<'left' | 'right'>('left');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  // Output
  readonly clicked = output<MouseEvent>();

  // Computed classes
  readonly buttonClasses = computed(() => {
    const classes = ['scout-btn'];
    classes.push(`scout-btn--${this.variant()}`);
    classes.push(`scout-btn--${this.size()}`);

    if (this.fullWidth()) classes.push('scout-btn--full-width');
    if (this.loading()) classes.push('scout-btn--loading');
    if (this.disabled() || this.loading()) classes.push('scout-btn--disabled');

    return classes.join(' ');
  });

  readonly isDisabled = computed(() => this.disabled() || this.loading());

  onClick(event: MouseEvent): void {
    if (!this.isDisabled()) {
      this.clicked.emit(event);
    }
  }
}
