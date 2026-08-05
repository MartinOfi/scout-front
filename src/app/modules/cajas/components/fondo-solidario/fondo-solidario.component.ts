/**
 * Fondo Solidario Component
 * Muestra el saldo del fondo solidario y permite crearlo o financiarlo.
 * Su saldo NO es parte de la caja de grupo.
 */

import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  computed,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TransferenciaDialogComponent } from '../../../movimientos/components/transferencia-dialog/transferencia-dialog.component';
import { MovimientosApiService } from '../../../movimientos/services/movimientos-api.service';
import { CajasStateService } from '../../services/cajas-state.service';
import { CajaType } from '../../../../shared/enums';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';
import { ConfirmDialogService } from '../../../../shared/services';
import { formatMoney } from '../../../../shared/pipes/money.pipe';

@Component({
  selector: 'app-fondo-solidario',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StatCardComponent,
    ActionButtonComponent,
    DataTableComponent,
  ],
  templateUrl: './fondo-solidario.component.html',
  styleUrl: './fondo-solidario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FondoSolidarioComponent implements OnInit {
  private readonly state = inject(CajasStateService);
  private readonly dialog = inject(MatDialog);
  private readonly movimientosApi = inject(MovimientosApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly cajaFondoSolidarioId = this.state.cajaFondoSolidarioId;
  readonly saldo = this.state.saldoFondoSolidario;
  readonly bonificacionesOtorgadas = this.state.bonificacionesOtorgadas;
  readonly transferencias = this.state.transferenciasFondoSolidario;

  readonly transferenciasColumns: TableColumn[] = [
    { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
    { key: 'descripcion', header: 'Descripción', type: 'text' },
    { key: 'responsable', header: 'Responsable', type: 'text' },
    {
      key: 'monto',
      header: 'Monto',
      type: 'number',
      sortable: true,
      formatter: (value: unknown) => formatMoney(value as number, 2),
    },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        {
          key: 'delete',
          label: 'Eliminar',
          icon: 'delete',
          className: 'text-red-600',
          tooltip: 'Eliminar transferencia',
        },
      ],
    },
  ];

  readonly transferenciasTableData = computed((): TableData[] => {
    return this.transferencias().map((m) => ({
      id: m.id,
      fecha: m.fecha,
      descripcion: m.descripcion || '-',
      responsable: m.responsable?.nombre ?? '-',
      monto: m.monto,
    }));
  });

  ngOnInit(): void {
    this.state.loadConsolidado();
    this.state.loadTransferenciasFondoSolidario();
  }

  onCrear(): void {
    this.state
      .create({ tipo: CajaType.FONDO_SOLIDARIO, nombre: 'Fondo Solidario' })
      .subscribe(() => this.state.loadConsolidado());
  }

  onTransferir(): void {
    const cajaGrupo = this.state.cajaGrupo();
    if (!cajaGrupo) return;

    const ref = this.dialog.open(TransferenciaDialogComponent, {
      data: { cajaGrupo },
      autoFocus: false,
      restoreFocus: false,
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.state.loadConsolidado();
        this.state.loadTransferenciasFondoSolidario();
      }
    });
  }

  onTableAction(event: ActionEvent): void {
    if (event.action === 'delete') {
      this.onEliminarTransferencia(event.row['id'] as string);
    }
  }

  onEliminarTransferencia(id: string): void {
    this.confirmDialog
      .delete('transferencia', () => this.movimientosApi.delete(id), {
        warning:
          'Se eliminará también el egreso correspondiente en la caja de origen. Esta acción no se puede deshacer.',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.confirmed) {
          this.state.loadTransferenciasFondoSolidario();
          this.state.loadConsolidado();
        }
      });
  }
}
