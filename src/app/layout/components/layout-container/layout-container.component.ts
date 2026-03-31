import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { PageMetadataService } from '../../services/page-metadata.service';
import { BreakpointService } from '../../../core/services';

@Component({
  selector: 'app-layout-container',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    PageHeaderComponent,
  ],
  templateUrl: './layout-container.component.html',
  styleUrl: './layout-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutContainerComponent {
  private readonly breakpoint = inject(BreakpointService);
  private readonly pageMetadata = inject(PageMetadataService);
  private readonly sidenav = viewChild<MatSidenav>('sidenav');

  /** Sidebar collapsed state (desktop only) */
  readonly sidebarCollapsed = signal(false);

  /** Mobile sidebar open state */
  readonly sidebarOpen = signal(false);

  /** Reactive breakpoint signals */
  readonly isMobile = this.breakpoint.isMobile;
  readonly isDesktop = this.breakpoint.isDesktop;

  /** Page title for mobile header */
  readonly pageTitle = computed(() => this.pageMetadata.pageMetadata()?.title ?? 'Scout Finance');

  /** Sidenav mode based on viewport */
  readonly sidenavMode = computed(() => (this.isMobile() ? 'over' : 'side'));

  /** Sidenav opened state */
  readonly sidenavOpened = computed(() => {
    if (this.isMobile()) {
      return this.sidebarOpen();
    }
    return true; // Always open on desktop
  });

  onSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebarOnMobile(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  onSidenavOpenedChange(opened: boolean): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(opened);
    }
  }
}
