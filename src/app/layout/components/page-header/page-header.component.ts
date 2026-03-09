import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { PageMetadataService } from '../../services/page-metadata.service';

/**
 * Displays the page title and subtitle from route metadata.
 * This is a presentational component that reads from PageMetadataService.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  private readonly pageMetadataService = inject(PageMetadataService);

  readonly metadata = this.pageMetadataService.pageMetadata;
}
