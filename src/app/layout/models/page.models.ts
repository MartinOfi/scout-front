/**
 * Metadata for a page displayed in the layout header.
 */
export interface PageMetadata {
  readonly title: string;
  readonly subtitle?: string;
}

/**
 * Extended route data interface that includes page metadata.
 */
export interface RouteDataWithPage {
  readonly page?: PageMetadata;
}
