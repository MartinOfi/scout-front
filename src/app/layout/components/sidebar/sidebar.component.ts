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

import { SidebarItemComponent } from '../sidebar-item/sidebar-item.component';
import type { SidebarItem, UserInfo } from '../../models/sidebar.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, SidebarItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly router = inject(Router);

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
    { icon: 'event', label: 'Eventos y Campamentos', route: '/eventos' },
    { icon: 'people', label: 'Gestión de Personas', route: '/personas' },
    { icon: 'assessment', label: 'Reportes', route: '/reportes' },
    { icon: 'settings', label: 'Configuración', route: '/configuracion' },
  ];

  readonly user = signal<UserInfo>({
    name: 'Usuario Scout',
    email: 'usuario@scout.org',
  });

  readonly toggleIcon = computed(() =>
    this.isCollapsed() ? 'chevron_right' : 'chevron_left'
  );

  toggle(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
    this.collapsed.emit(this.isCollapsed());
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
