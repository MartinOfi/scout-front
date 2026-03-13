/**
 * Campamento Detail Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { from, switchMap } from 'rxjs';

import { CampamentosStateService } from '../../../services';
import { LoadingSpinnerComponent, ConfirmDialogService } from '../../../../../shared';
import { Campamento, PagoParticipante, PagoDetalle, RegistrarPagoCampamentoDto, UpdatePagoDto } from '../../../../../shared/models';
import {
  PagoCampamentoDialogData,
  PagoCampamentoDialogResult,
} from '../../shared/pago-campamento-dialog/pago-campamento-dialog.component';

@Component({
  selector: 'app-campamento-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
  ],
  templateUrl: './campamento-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampamentoDetailComponent implements OnInit {
  // Services
  readonly state: CampamentosStateService = inject(CampamentosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  // Signals
  readonly campamento = signal<Campamento | null>(null);
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Pagos for current campamento */
  readonly pagosParticipantes = computed((): PagoParticipante[] => {
    const camp = this.campamento();
    if (!camp) return [];
    const pagosRecord = this.state.pagosPorParticipante();
    return pagosRecord[camp.id] ?? [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCampamento(id);
    }
  }

  loadCampamento(id: string): void {
    // TODO: Implementar getById en CampamentosStateService
    // Por ahora buscar en el array
    const found = this.state.campamentos().find(c => c.id === id);
    if (found) {
      this.campamento.set(found);
      this.state.loadPagosPorParticipante(id);
    }
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/campamentos', id, 'editar']);
    }
  }

  onDelete(): void {
    this.confirmDialog.confirmDelete('campamento').subscribe((confirmed: boolean) => {
      if (confirmed) {
        // TODO: Implementar delete
        this.router.navigate(['/campamentos']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/campamentos']);
  }

  onAddParticipante(): void {
    // TODO: Abrir dialog para agregar participante
    console.log('Add participante');
  }

  /** Open payment dialog for creating a new payment */
  onRegistrarPago(participante: PagoParticipante): void {
    const camp = this.campamento();
    if (!camp) return;

    const dialogData: PagoCampamentoDialogData = {
      campamentoId: camp.id,
      participanteId: participante.participanteId,
      participanteNombre: participante.participanteNombre,
      costoPorPersona: participante.costoPorPersona,
      totalPagado: participante.totalPagado,
      montoPendiente: participante.saldoPendiente,
      saldoCuentaPersonal: 0, // TODO: Fetch from CajasApi if needed
      mode: 'create',
    };

    this.openPaymentDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: PagoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(camp.id, participante.participanteId, result);
      });
  }

  /** Open payment dialog for editing an existing payment */
  onEditPago(participante: PagoParticipante, pago: PagoDetalle): void {
    const camp = this.campamento();
    if (!camp) return;

    const dialogData: PagoCampamentoDialogData = {
      campamentoId: camp.id,
      participanteId: participante.participanteId,
      participanteNombre: participante.participanteNombre,
      costoPorPersona: participante.costoPorPersona,
      totalPagado: participante.totalPagado,
      montoPendiente: participante.saldoPendiente,
      mode: 'edit',
      existingPago: pago,
    };

    this.openPaymentDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: PagoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(camp.id, participante.participanteId, result);
      });
  }

  onRegistrarGasto(): void {
    // TODO: Abrir dialog para registrar gasto
    console.log('Registrar gasto');
  }

  /** Open payment dialog with dynamic import */
  private openPaymentDialog(dialogData: PagoCampamentoDialogData) {
    return from(
      import('../../shared/pago-campamento-dialog/pago-campamento-dialog.component').then(
        ({ PagoCampamentoDialogComponent }) => {
          const dialogRef = this.dialog.open(PagoCampamentoDialogComponent, {
            width: '500px',
            maxWidth: '90vw',
            data: dialogData,
            disableClose: false,
          });
          return dialogRef;
        },
      ),
    );
  }

  /** Handle dialog result based on mode */
  private handleDialogResult(
    campamentoId: string,
    participanteId: string,
    result: PagoCampamentoDialogResult,
  ): void {
    switch (result.mode) {
      case 'create': {
        const dto: RegistrarPagoCampamentoDto = {
          personaId: participanteId,
          monto: result.data.monto,
          medioPago: result.data.medioPago,
          descripcion: result.data.descripcion,
        };
        this.state.registrarPago(campamentoId, dto).subscribe();
        break;
      }
      case 'edit': {
        const updateDto: UpdatePagoDto = {
          monto: result.data.monto,
          medioPago: result.data.medioPago,
          descripcion: result.data.descripcion,
        };
        this.state.updatePago(campamentoId, result.movimientoId, updateDto).subscribe();
        break;
      }
      case 'delete': {
        this.state.deletePago(campamentoId, result.movimientoId).subscribe();
        break;
      }
    }
  }
}
