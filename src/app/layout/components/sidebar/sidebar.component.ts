import {
  Component,
  ChangeDetectionStrategy,
  signal,
  output,
  inject,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SidebarItemComponent } from '../sidebar-item/sidebar-item.component';
import type { SidebarItem } from '../../models/sidebar.models';
import { AuthStateService } from '../../../modules/auth/services';
import { AUTH_USER_TYPE_LABELS } from '../../../modules/auth/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, SidebarItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);

  readonly isCollapsed = signal(false);
  readonly collapsed = output<boolean>();

  readonly menuItems: readonly SidebarItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'how_to_reg', label: 'Inscripciones', route: '/inscripciones' },
    {
      icon: 'account_balance_wallet',
      label: 'Gestión Financiera',
      route: '/cajas',
    },
    { icon: 'swap_horiz', label: 'Movimientos', route: '/movimientos' },
    // { icon: 'event', label: 'Eventos y Campamentos', route: '/eventos' },
    { icon: 'people', label: 'Gestión de Personas', route: '/personas' },
    // { icon: 'assessment', label: 'Reportes', route: '/reportes' },
    { icon: 'settings', label: 'Configuración', route: '/configuracion' },
  ];

  /** Current authenticated user from auth state */
  readonly currentUser = this.authState.currentUser;

  /** User display name computed from current user */
  readonly displayName = computed(() => {
    const user = this.currentUser();
    return user?.nombre ?? 'Usuario';
  });

  /** User email computed from current user */
  readonly userEmail = computed(() => {
    const user = this.currentUser();
    return user?.email ?? '';
  });

  /** User role label for display */
  readonly userRole = computed(() => {
    const user = this.currentUser();
    return user ? AUTH_USER_TYPE_LABELS[user.tipo] : '';
  });

  readonly toggleIcon = computed(() => (this.isCollapsed() ? 'chevron_right' : 'chevron_left'));

  toggle(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
    this.collapsed.emit(this.isCollapsed());
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  /**
   * Logout the current user
   * Clears session and redirects to login
   */
  logout(): void {
    this.authState.logout();
  }
}
