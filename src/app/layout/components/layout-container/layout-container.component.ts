import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'app-layout-container',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, PageHeaderComponent],
  templateUrl: './layout-container.component.html',
  styleUrl: './layout-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutContainerComponent {
  readonly sidebarCollapsed = signal(false);

  onSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}
