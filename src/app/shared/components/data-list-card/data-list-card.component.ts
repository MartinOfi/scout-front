/**
 * DataListCard Component
 * Container card with title, optional link, and content projection for list items
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LinkButtonComponent } from '../link-button/link-button.component';

@Component({
  selector: 'app-data-list-card',
  standalone: true,
  imports: [LinkButtonComponent],
  templateUrl: './data-list-card.component.html',
  styleUrl: './data-list-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListCardComponent {
  readonly title = input.required<string>();
  readonly linkText = input<string>('');
  readonly linkIcon = input<string>('arrow_forward');

  readonly linkClicked = output<void>();

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
