import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

import type { PageMetadata } from '../models/page.models';

/**
 * Service that extracts page metadata from the active route.
 * Uses signals for reactive state management.
 */
@Injectable({ providedIn: 'root' })
export class PageMetadataService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  /**
   * Signal containing the current page metadata from the deepest active route.
   * Updates automatically on navigation.
   */
  readonly pageMetadata = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.getDeepestRouteData()),
      startWith(this.getDeepestRouteData())
    ),
    { initialValue: null }
  );

  /**
   * Traverses the route tree to find the deepest child route
   * and extracts its page metadata.
   */
  private getDeepestRouteData(): PageMetadata | null {
    let route: ActivatedRoute | null = this.activatedRoute.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return (route?.snapshot?.data?.['page'] as PageMetadata) ?? null;
  }
}
