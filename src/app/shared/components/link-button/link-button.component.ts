/**
 * LinkButton Component
 * Reusable link-style button without background
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-link-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './link-button.component.html',
  styleUrl: './link-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkButtonComponent {
  readonly text = input.required<string>();
  readonly icon = input<string>('arrow_forward');
  readonly showIcon = input<boolean>(true);

  readonly clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
