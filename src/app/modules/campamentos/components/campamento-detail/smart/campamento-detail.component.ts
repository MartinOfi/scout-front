/**
 * Campamento Detail Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { from, switchMap } from 'rxjs';

import { CampamentosStateService } from '../../../services';
import {
  LoadingSpinnerComponent,
  ConfirmDialogService,
  EmptyStateComponent,
} from '../../../../../shared';
import {
  StatCardComponent,
  StatCardVariant,
} from '../../../../../shared/components/stat-card/stat-card.component';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../../shared/components/button-tabs/button-tabs.component';
import {
  CampamentoInfoDto,
  CampamentoKpisDto,
  ParticipantePagoDto,
  MovimientoCampamentoDto,
  PagoParticipanteDto,
  RegistrarPagoCampamentoDto,
  UpdatePagoDto,
} from '../../../../../shared/models';
import {
  PagoCampamentoDialogData,
  PagoCampamentoDialogResult,
} from '../../shared/pago-campamento-dialog/pago-campamento-dialog.component';

interface KpiConfig {
  readonly icon: string;
  readonly title: string;
  readonly key: keyof Pick<
    CampamentoKpisDto,
    'totalARecaudar' | 'totalRecaudado' | 'totalGastado' | 'balance'
  >;
  readonly variant: StatCardVariant;
}

@Component({
  selector: 'app-campamento-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatCardComponent,
    ButtonTabsComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './campamento-detail.component.html',
  styleUrl: './campamento-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampamentoDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  readonly state = inject(CampamentosStateService);

  // Consolidated detail data from state
  readonly campamento = this.state.detalleInfo;
  readonly kpis = this.state.detalleKpis;
  readonly participantes = this.state.detalleParticipantes;
  readonly movimientos = this.state.detalleMovimientos;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  /** Active tab key */
  readonly activeTab = signal<string>('participantes');

  /** Tab configurations */
  readonly tabs: TabConfig[] = [
    { key: 'participantes', label: 'Participantes', icon: 'people' },
    { key: 'movimientos', label: 'Movimientos', icon: 'swap_horiz' },
  ];

  /** KPI configurations - mapped to CampamentoKpisDto keys */
  readonly kpiConfigs: readonly KpiConfig[] = [
    { icon: 'account_balance', title: 'Total a Recaudar', key: 'totalARecaudar', variant: 'info' },
    { icon: 'payments', title: 'Recaudado', key: 'totalRecaudado', variant: 'success' },
    { icon: 'shopping_cart', title: 'Gastado', key: 'totalGastado', variant: 'warning' },
    { icon: 'savings', title: 'Balance', key: 'balance', variant: 'primary' },
  ];

  /** Progress percentage */
  readonly progressPercent = computed((): number => {
    const k = this.kpis();
    if (!k || k.totalARecaudar === 0) return 0;
    return Math.min((k.totalRecaudado / k.totalARecaudar) * 100, 100);
  });

  /** Days until camp starts */
  readonly diasRestantes = computed((): number | null => {
    const camp = this.campamento();
    if (!camp) return null;
    const today = new Date();
    const start = new Date(camp.fechaInicio);
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCampamento(id);
    }
  }

  loadCampamento(id: string): void {
    // Single API call loads all detail data (campamento info, participants, movements, KPIs)
    this.state.loadDetalle(id);
  }

  onTabChange(key: string): void {
    this.activeTab.set(key);
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
  onRegistrarPago(participante: ParticipantePagoDto): void {
    const camp = this.campamento();
    if (!camp) return;

    const dialogData: PagoCampamentoDialogData = {
      campamentoId: camp.id,
      participanteId: participante.id,
      participanteNombre: participante.nombre,
      costoPorPersona: participante.costoPorPersona,
      totalPagado: participante.totalPagado,
      montoPendiente: participante.saldoPendiente,
      saldoCuentaPersonal: 0,
      mode: 'create',
    };

    this.openPaymentDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: PagoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(camp.id, participante.id, result);
      });
  }

  /** Open payment dialog for editing an existing payment */
  onEditPago(participante: ParticipantePagoDto, pago: PagoParticipanteDto): void {
    const camp = this.campamento();
    if (!camp) return;

    const dialogData: PagoCampamentoDialogData = {
      campamentoId: camp.id,
      participanteId: participante.id,
      participanteNombre: participante.nombre,
      costoPorPersona: participante.costoPorPersona,
      totalPagado: participante.totalPagado,
      montoPendiente: participante.saldoPendiente,
      mode: 'edit',
      existingPago: {
        movimientoId: pago.movimientoId,
        fecha: pago.fecha,
        monto: pago.monto,
        medioPago: pago.medioPago,
      },
    };

    this.openPaymentDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: PagoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(camp.id, participante.id, result);
      });
  }

  onRegistrarGasto(): void {
    // TODO: Abrir dialog para registrar gasto
    console.log('Registrar gasto');
  }

  private openPaymentDialog(dialogData: PagoCampamentoDialogData) {
    return from(
      import('../../shared/pago-campamento-dialog/pago-campamento-dialog.component').then(
        ({ PagoCampamentoDialogComponent }) => {
          return this.dialog.open(PagoCampamentoDialogComponent, {
            width: '500px',
            maxWidth: '90vw',
            data: dialogData,
            disableClose: false,
          });
        },
      ),
    );
  }

  private handleDialogResult(
    campamentoId: string,
    participanteId: string,
    result: PagoCampamentoDialogResult,
  ): void {
    // All state methods (registrarPago, updatePago, deletePago) now automatically
    // reload the detalle after success, so no additional callback needed
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
