/**
 * Dashboard Component
 * Smart Component - Página principal con resumen financiero
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  StatCardComponent,
  StatCardVariant,
  DataListCardComponent,
  DataListItemComponent,
  IconVariant,
  ActionButtonComponent,
  ActionButtonVariant,
  EventListItemComponent,
  EventCategoryConfig,
} from '../../shared';

interface StatConfig {
  readonly icon: string;
  readonly title: string;
  readonly value: number;
  readonly variant: StatCardVariant;
}

interface MovimientoConfig {
  readonly icon: string;
  readonly iconVariant: IconVariant;
  readonly concepto: string;
  readonly detalle: string;
  readonly monto: number;
}

interface FondoRamaConfig {
  readonly icon: string;
  readonly iconVariant: IconVariant;
  readonly nombre: string;
  readonly protagonistas: number;
  readonly saldo: number;
}

interface QuickActionConfig {
  readonly icon: string;
  readonly label: string;
  readonly route: string;
  readonly variant: ActionButtonVariant;
}

interface UpcomingEventConfig {
  readonly id: string;
  readonly titulo: string;
  readonly fecha: Date;
  readonly categoria: EventCategoryConfig;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    DataListCardComponent,
    DataListItemComponent,
    ActionButtonComponent,
    EventListItemComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly stats: readonly StatConfig[] = [
    { icon: 'account_balance', title: 'Caja de Grupo', value: 285600, variant: 'success' },
    { icon: 'savings', title: 'Fondos de Rama', value: 176700, variant: 'info' },
    { icon: 'person', title: 'Cuentas Personales', value: 83700, variant: 'warning' },
    { icon: 'receipt_long', title: 'Reembolsos Pendientes', value: 20800, variant: 'danger' },
  ];

  readonly movimientosRecientes: readonly MovimientoConfig[] = [
    {
      icon: 'south',
      iconVariant: 'danger',
      concepto: 'Pago inscripción campamento',
      detalle: 'María García • 15/02/2024',
      monto: -45000,
    },
    {
      icon: 'north',
      iconVariant: 'success',
      concepto: 'Cuota mensual febrero',
      detalle: 'Juan Pérez • 14/02/2024',
      monto: 12500,
    },
    {
      icon: 'south',
      iconVariant: 'danger',
      concepto: 'Gasto materiales campamento',
      detalle: 'Compras varias • 13/02/2024',
      monto: -8200,
    },
  ];

  readonly fondosRama: readonly FondoRamaConfig[] = [
    {
      icon: 'pets',
      iconVariant: 'warning',
      nombre: 'Manada',
      protagonistas: 12,
      saldo: 85400,
    },
    {
      icon: 'explore',
      iconVariant: 'info',
      nombre: 'Unidad Scout',
      protagonistas: 18,
      saldo: 52300,
    },
    {
      icon: 'hiking',
      iconVariant: 'success',
      nombre: 'Caminantes',
      protagonistas: 15,
      saldo: 39000,
    },
  ];

  readonly quickActions: readonly QuickActionConfig[] = [
    { icon: 'person_add', label: 'Registrar Inscripción', route: '/inscripciones/crear', variant: 'primary' },
    { icon: 'event', label: 'Crear Evento', route: '/eventos/crear', variant: 'info' },
    { icon: 'receipt_long', label: 'Registrar Gasto', route: '/movimientos/nuevo', variant: 'success' },
    { icon: 'assessment', label: 'Ver Reportes', route: '/reportes', variant: 'warning' },
  ];

  readonly proximosEventos: readonly UpcomingEventConfig[] = [
    {
      id: '1',
      titulo: 'Venta de Empanadas',
      fecha: new Date(2025, 1, 27),
      categoria: { label: 'Venta', backgroundColor: '#e8f5e9', textColor: '#2e7d32' },
    },
    {
      id: '2',
      titulo: 'Campamento de Verano',
      fecha: new Date(2025, 2, 14),
      categoria: { label: 'Campamento', backgroundColor: '#fff3e0', textColor: '#ef6c00' },
    },
    {
      id: '3',
      titulo: 'Kermesse Anual',
      fecha: new Date(2025, 3, 19),
      categoria: { label: 'Grupo', backgroundColor: '#e3f2fd', textColor: '#1565c0' },
    },
  ];

  onVerMasMovimientos(): void {
    // TODO: Navigate to movimientos list
    console.log('Ver más movimientos');
  }

  onQuickAction(route: string): void {
    // TODO: Navigate to route
    console.log('Quick action:', route);
  }

  onVerTodosEventos(): void {
    // TODO: Navigate to eventos list
    console.log('Ver todos los eventos');
  }

  onEventoClick(id: string): void {
    // TODO: Navigate to evento detail
    console.log('Evento click:', id);
  }
}
