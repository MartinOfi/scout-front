import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { PageMetadataService } from '../../services/page-metadata.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/**
 * Displays the page title and subtitle from route metadata,
 * with the theme toggle anchored on the right.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ThemeToggleComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  private readonly pageMetadataService = inject(PageMetadataService);

  readonly metadata = this.pageMetadataService.pageMetadata;
}
