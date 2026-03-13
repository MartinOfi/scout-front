/**
 * Cajas Page Component
 * Página principal del módulo de cajas
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../shared/components/button-tabs/button-tabs.component';
import { CajaGrupoComponent } from '../components/caja-grupo/caja-grupo.component';
import { FondosRamaComponent } from '../components/fondos-rama/fondos-rama.component';
import { CuentasPersonalesComponent } from '../components/cuentas-personales/cuentas-personales.component';
import { CajaDrawerComponent } from '../components/caja-drawer/caja-drawer.component';
import { CajasStateService } from '../services/cajas-state.service';
import {
  QuickMovimientoDialogComponent,
  QuickMovimientoDialogData,
  QuickMovimientoDialogResult,
} from '../components/shared/quick-movimiento-dialog/quick-movimiento-dialog.component';
import { MovimientosApiService } from '../../movimientos/services/movimientos-api.service';

@Component({
  selector: 'app-cajas-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    ButtonTabsComponent,
    CajaGrupoComponent,
    FondosRamaComponent,
    CuentasPersonalesComponent,
    CajaDrawerComponent,
  ],
  templateUrl: './cajas-page.component.html',
  styleUrls: ['./cajas-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajasPageComponent {
  private readonly router = inject(Router);
  private readonly state = inject(CajasStateService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly movimientosApi = inject(MovimientosApiService);

  readonly drawerOpen = this.state.drawerOpen;
  readonly selectedCaja = this.state.selectedCaja;

  readonly tabs: TabConfig[] = [
    { key: 'grupo', label: 'Caja de Grupo', icon: 'account_balance_wallet' },
    { key: 'rama', label: 'Fondos de Rama', icon: 'forest' },
    { key: 'personal', label: 'Cuentas Personales', icon: 'person' },
  ];

  readonly activeTab = signal<string>('grupo');

  onTabChange(tabKey: string): void {
    this.activeTab.set(tabKey);
  }

  onDrawerClosed(): void {
    this.state.closeDrawer();
  }

  onRegistrarMovimiento(): void {
    const caja = this.selectedCaja();
    if (!caja) return;

    const dialogRef = this.dialog.open<
      QuickMovimientoDialogComponent,
      QuickMovimientoDialogData,
      QuickMovimientoDialogResult
    >(QuickMovimientoDialogComponent, {
      data: { caja },
      width: '540px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.dto) {
        this.movimientosApi.create(result.dto).subscribe({
          next: () => {
            this.snackBar.open('Movimiento registrado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            // Refresh the selected caja movimientos
            this.state.refreshSelectedCajaMovimientos();
          },
          error: () => {
            this.snackBar.open('Error al registrar el movimiento', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    });
  }

  onVerTodosMovimientos(): void {
    const caja = this.selectedCaja();
    if (caja) {
      this.router.navigate(['/movimientos'], { queryParams: { cajaId: caja.id } });
    }
  }
}
