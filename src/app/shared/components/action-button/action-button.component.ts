/**
 * ActionButton Component
 * Colored button with icon and label for quick actions grid
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActionButtonVariant } from '../data-list/data-list.models';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly variant = input<ActionButtonVariant>('primary');

  readonly clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
