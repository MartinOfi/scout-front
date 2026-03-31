import { Injectable, computed, signal, DestroyRef, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, distinctUntilChanged } from 'rxjs';

/**
 * Breakpoint definitions aligned with SCSS and Tailwind
 *
 * Usage in components:
 * ```typescript
 * export class MyComponent {
 *   private breakpoint = inject(BreakpointService);
 *
 *   // Use as signals in template
 *   isMobile = this.breakpoint.isMobile;
 *   isTablet = this.breakpoint.isTablet;
 *   isDesktop = this.breakpoint.isDesktop;
 *
 *   // Or get current breakpoint name
 *   currentBreakpoint = this.breakpoint.current;
 * }
 * ```
 *
 * In template:
 * ```html
 * <div *ngIf="isMobile()">Mobile content</div>
 * <div *ngIf="isDesktop()">Desktop content</div>
 *
 * @if (isMobile()) {
 *   <app-mobile-nav />
 * } @else {
 *   <app-sidebar />
 * }
 * ```
 */
export const BREAKPOINTS = {
  xs: 375,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

/**
 * Media query strings for BreakpointObserver
 */
const MEDIA_QUERIES = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS['2xl'] - 1}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  // Convenience queries
  mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
} as const;

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Internal state tracking all breakpoint matches
   */
  private readonly breakpointState = toSignal(
    this.breakpointObserver
      .observe([MEDIA_QUERIES.mobile, MEDIA_QUERIES.tablet, MEDIA_QUERIES.desktop])
      .pipe(
        map((result) => ({
          isMobile: result.breakpoints[MEDIA_QUERIES.mobile] ?? false,
          isTablet: result.breakpoints[MEDIA_QUERIES.tablet] ?? false,
          isDesktop: result.breakpoints[MEDIA_QUERIES.desktop] ?? false,
        })),
        distinctUntilChanged(
          (prev, curr) =>
            prev.isMobile === curr.isMobile &&
            prev.isTablet === curr.isTablet &&
            prev.isDesktop === curr.isDesktop
        ),
        takeUntilDestroyed(this.destroyRef)
      ),
    {
      initialValue: {
        isMobile: false,
        isTablet: false,
        isDesktop: true, // Default to desktop for SSR
      },
    }
  );

  /**
   * True when viewport is below 768px (mobile phones)
   */
  readonly isMobile = computed(() => this.breakpointState().isMobile);

  /**
   * True when viewport is between 768px and 1023px (tablets)
   */
  readonly isTablet = computed(() => this.breakpointState().isTablet);

  /**
   * True when viewport is 1024px or above (desktop/laptop)
   */
  readonly isDesktop = computed(() => this.breakpointState().isDesktop);

  /**
   * True when viewport is below 1024px (mobile or tablet)
   */
  readonly isMobileOrTablet = computed(() => this.isMobile() || this.isTablet());

  /**
   * True when viewport is 768px or above (tablet or desktop)
   */
  readonly isTabletOrDesktop = computed(() => this.isTablet() || this.isDesktop());

  /**
   * Current breakpoint name
   */
  readonly current = computed<BreakpointName>(() => {
    if (this.isMobile()) return 'sm';
    if (this.isTablet()) return 'md';
    return 'lg';
  });

  /**
   * Viewport width signal (updated on resize)
   */
  readonly viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);

  constructor() {
    // Update viewport width on resize
    if (typeof window !== 'undefined') {
      const updateWidth = () => this.viewportWidth.set(window.innerWidth);
      window.addEventListener('resize', updateWidth, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', updateWidth));
    }
  }

  /**
   * Check if current viewport matches a specific breakpoint
   * @param breakpoint Breakpoint name to check
   */
  matches(breakpoint: BreakpointName): boolean {
    return this.breakpointObserver.isMatched(
      MEDIA_QUERIES[breakpoint as keyof typeof MEDIA_QUERIES]
    );
  }

  /**
   * Check if current viewport is at least the specified breakpoint
   * @param breakpoint Minimum breakpoint
   */
  isAtLeast(breakpoint: BreakpointName): boolean {
    const width = this.viewportWidth();
    return width >= BREAKPOINTS[breakpoint];
  }

  /**
   * Check if current viewport is below the specified breakpoint
   * @param breakpoint Maximum breakpoint (exclusive)
   */
  isBelow(breakpoint: BreakpointName): boolean {
    const width = this.viewportWidth();
    return width < BREAKPOINTS[breakpoint];
  }
}
