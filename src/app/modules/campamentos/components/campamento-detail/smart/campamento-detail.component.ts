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
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, from, firstValueFrom, switchMap, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CampamentosStateService } from '../../../services';
import { CajasApiService } from '../../../../cajas/services/cajas-api.service';
import { PersonasApiService } from '../../../../personas/services/personas-api.service';
import { MovimientosApiService } from '../../../../movimientos/services/movimientos-api.service';
import {
  MovimientoCardComponent,
  MovimientoCardVM,
} from '../../../../../shared/components/movimiento-card/movimiento-card.component';
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
  PagoParticipanteDto,
  RegistrarPagoCampamentoDto,
  UpdatePagoDto,
  UpdateParticipanteAutorizacionDto,
} from '../../../../../shared/models';
import {
  PagoCampamentoDialogData,
  PagoCampamentoDialogResult,
} from '../../shared/pago-campamento-dialog/pago-campamento-dialog.component';
import {
  BonificarParticipanteDialogData,
  BonificarParticipanteDialogResult,
} from '../../shared/bonificar-participante-dialog/bonificar-participante-dialog.component';
import {
  GastoCampamentoDialogData,
  GastoCampamentoDialogResult,
} from '../../shared/gasto-campamento-dialog/gasto-campamento-dialog.component';
import {
  PersonaSelectorDialogData,
  PersonaSelectorDialogResult,
} from '../../../../../shared/components/persona-selector-dialog/persona-selector-dialog.component';
import { AddParticipanteDto } from '../../../../../shared/models';
import { formatMoney, MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import {
  EstadoPago,
  EstadoPagoCampamento,
  PersonaType,
  FiltroMovimientos,
} from '../../../../../shared/enums';
import { FilterValueMap } from '../../../../../shared/components/filters/generic-filters/filter-value.type';
import { ParticipantesFiltrosComponent } from '../components/participantes-filtros/participantes-filtros.component';

interface KpiConfig {
  readonly icon: string;
  readonly title: string;
  readonly key: keyof Pick<
    CampamentoKpisDto,
    'totalARecaudar' | 'totalRecaudado' | 'totalGastado' | 'totalPendienteReembolso' | 'balance'
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
    MovimientoCardComponent,
    MoneyPipe,
    DatePipe,
    ParticipantesFiltrosComponent,
  ],
  templateUrl: './campamento-detail.component.html',
  styleUrl: './campamento-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampamentoDetailComponent implements OnInit {
  protected readonly EstadoPagoCampamento = EstadoPagoCampamento;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  private readonly cajasApi = inject(CajasApiService);
  private readonly personasApi = inject(PersonasApiService);
  private readonly movimientosApi = inject(MovimientosApiService);
  readonly state = inject(CampamentosStateService);

  // Consolidated detail data from state
  readonly campamento = this.state.detalleInfo;
  readonly kpis = this.state.detalleKpis;
  readonly participantes = this.state.detalleParticipantes;
  readonly movimientos = this.state.detalleMovimientos;
  readonly loading = this.state.loading;
  readonly initialLoading = this.state.initialLoading;
  readonly refreshing = this.state.refreshing;
  readonly error = this.state.error;

  /** Active tab key */
  readonly activeTab = signal<string>('participantes');

  /** Active movements filter */
  readonly filtroMovimientos = signal<FiltroMovimientos>(FiltroMovimientos.TODOS);

  private readonly participantesFilter = signal<{ nombre?: string; rama?: string }>({});
  private readonly filterSubject = new Subject<{ nombre?: string; rama?: string }>();
  readonly hasParticipantesFilter = computed((): boolean => {
    const f = this.participantesFilter();
    return !!(f.nombre || f.rama);
  });

  constructor() {
    this.filterSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((filter) => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.state.loadDetalle(id, this.filtroMovimientos(), filter);
      }
    });
  }

  /** Tab configurations */
  readonly tabs: TabConfig[] = [
    { key: 'participantes', label: 'Participantes', icon: 'people' },
    { key: 'movimientos', label: 'Movimientos', icon: 'swap_horiz' },
  ];

  /** Filter tab configurations for movimientos */
  readonly filtroTabs: TabConfig[] = [
    { key: FiltroMovimientos.TODOS, label: 'Todos' },
    { key: FiltroMovimientos.INGRESOS, label: 'Ingresos' },
    { key: FiltroMovimientos.EGRESOS, label: 'Egresos' },
    { key: FiltroMovimientos.GASTOS, label: 'Gastos' },
  ];

  /** KPI configurations - mapped to CampamentoKpisDto keys */
  readonly kpiConfigs: readonly KpiConfig[] = [
    { icon: 'account_balance', title: 'Total a Recaudar', key: 'totalARecaudar', variant: 'info' },
    { icon: 'payments', title: 'Recaudado', key: 'totalRecaudado', variant: 'success' },
    { icon: 'shopping_cart', title: 'Gastado', key: 'totalGastado', variant: 'warning' },
    {
      icon: 'undo',
      title: 'Reembolsos Pendientes',
      key: 'totalPendienteReembolso',
      variant: 'danger',
    },
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
      this.state.clearDetalle();
      this.loadCampamento(id);
    }
  }

  loadCampamento(id: string): void {
    this.state.loadDetalle(id, this.filtroMovimientos(), this.participantesFilter());
  }

  onTabChange(key: string): void {
    this.activeTab.set(key);
  }

  onParticipantesFiltersChanged(filters: FilterValueMap): void {
    const nombre = filters['nombre'] as string | undefined;
    const rama = filters['rama'] as string | undefined;

    if (nombre && nombre.length < 3) return;

    const filter: { nombre?: string; rama?: string } = {};
    if (nombre) filter.nombre = nombre;
    if (rama) filter.rama = rama;

    const current = this.participantesFilter();
    if (filter.nombre === current.nombre && filter.rama === current.rama) return;

    this.participantesFilter.set(filter);
    this.filterSubject.next(filter);
  }

  onFiltroChange(key: string): void {
    const filtro = key as FiltroMovimientos;
    this.filtroMovimientos.set(filtro);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.state.loadDetalle(id, filtro, this.participantesFilter());
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
        this.router.navigate(['/campamentos']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/campamentos']);
  }

  onAddParticipante(): void {
    const camp = this.campamento();
    if (!camp) return;

    // Get existing participant IDs to exclude
    const existingIds = this.participantes().map((p) => p.id);

    const dialogData: PersonaSelectorDialogData = {
      title: 'Agregar Participante',
      subtitle: 'Seleccioná una persona para inscribir al campamento',
      filterByTypes: [PersonaType.PROTAGONISTA, PersonaType.EDUCADOR],
      excludeIds: existingIds,
      showRamaFilter: true,
      showAutorizacionField: true,
      confirmLabel: 'Agregar',
    };

    this.openPersonaSelectorDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: PersonaSelectorDialogResult | undefined) => {
        if (!result) return;
        const dto: AddParticipanteDto = {
          personaId: result.persona.id,
          autorizacionEntregada: result.autorizacionEntregada ?? false,
        };
        this.state.addParticipante(camp.id, dto).subscribe({
          next: () => {
            this.loadCampamento(camp.id);
          },
        });
      });
  }

  /** Open payment dialog for creating a new payment */
  onRegistrarPago(participante: ParticipantePagoDto): void {
    const camp = this.campamento();
    if (!camp) return;

    // Fetch personal account balance before opening the dialog
    this.cajasApi
      .getSaldoCuentaPersonal(participante.id)
      .pipe(
        switchMap((saldoCuentaPersonal: number) => {
          const dialogData: PagoCampamentoDialogData = {
            campamentoId: camp.id,
            participanteId: participante.id,
            participanteNombre: participante.nombre,
            costoPorPersona: participante.montoAsignado - participante.montoBonificado,
            totalPagado: participante.totalPagado,
            montoPendiente: participante.saldoPendiente,
            saldoCuentaPersonal,
            mode: 'create',
          };
          return this.openPaymentDialog(dialogData);
        }),
        switchMap((dialogRef) => dialogRef.afterClosed()),
      )
      .subscribe((result: PagoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(camp.id, participante.id, result);
      });
  }

  /** Open payment dialog for editing an existing payment */
  onEditPago(participante: ParticipantePagoDto, pago: PagoParticipanteDto): void {
    const camp = this.campamento();
    if (!camp) return;

    // Fetch saldo cuenta personal before opening dialog (same as create mode)
    this.cajasApi
      .getSaldoCuentaPersonal(participante.id)
      .pipe(
        switchMap((saldoCuentaPersonal: number) => {
          const dialogData: PagoCampamentoDialogData = {
            campamentoId: camp.id,
            participanteId: participante.id,
            participanteNombre: participante.nombre,
            costoPorPersona: participante.montoAsignado - participante.montoBonificado,
            totalPagado: participante.totalPagado,
            montoPendiente: participante.saldoPendiente,
            saldoCuentaPersonal,
            mode: 'edit',
            existingPago: {
              movimientoId: pago.movimientoId,
              fecha: pago.fecha,
              monto: pago.monto,
              medioPago: pago.medioPago,
            },
          };
          return this.openPaymentDialog(dialogData);
        }),
        switchMap((dialogRef) => dialogRef.afterClosed()),
      )
      .subscribe((result: PagoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.handleDialogResult(camp.id, participante.id, result);
      });
  }

  /** Open dialog to bonificar (or ajustar/quitar) a participant against the fondo solidario */
  onBonificar(participante: ParticipantePagoDto): void {
    const camp = this.campamento();
    if (!camp) return;

    const dialogData: BonificarParticipanteDialogData = {
      campamentoId: camp.id,
      personaId: participante.id,
      participanteNombre: participante.nombre,
      montoAsignado: participante.montoAsignado,
      montoBonificadoActual: participante.montoBonificado,
    };

    this.openBonificarDialog(dialogData)
      .pipe(switchMap((dialogRef) => dialogRef.afterClosed()))
      .subscribe((result: BonificarParticipanteDialogResult | undefined) => {
        if (!result) return;
        if (result.monto === 0) {
          this.state.quitarBonificacionParticipante(camp.id, participante.id).subscribe();
        } else {
          this.state.bonificarParticipante(camp.id, participante.id, result.monto).subscribe();
        }
      });
  }

  onPagarReembolso(movimiento: MovimientoCardVM): void {
    const camp = this.campamento();
    if (!camp) return;

    this.confirmDialog
      .confirmAsync(
        'Confirmar pago de reembolso',
        '¿Confirmás que este gasto fue reembolsado?',
        () =>
          firstValueFrom(
            this.movimientosApi.update(movimiento.id, { estadoPago: EstadoPago.PAGADO }),
          ).then(() => undefined),
        {
          icon: 'payments',
          confirmText: 'Pagar',
          cancelText: 'Cancelar',
          details: [
            { label: 'Monto', value: formatMoney(movimiento.monto) },
            { label: 'Descripción', value: movimiento.descripcion ?? 'Sin descripción' },
            { label: 'Responsable', value: movimiento.responsableNombre },
          ],
        },
      )
      .subscribe((result) => {
        if (result.confirmed) {
          this.loadCampamento(camp.id);
        }
      });
  }

  onRemoveParticipante(participante: ParticipantePagoDto): void {
    const camp = this.campamento();
    if (!camp) return;

    this.confirmDialog
      .confirmDelete(`participante "${participante.nombre}"`)
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.state.removeParticipante(camp.id, participante.id).subscribe({
          next: () => this.loadCampamento(camp.id),
        });
      });
  }

  onToggleAutorizacion(participante: ParticipantePagoDto): void {
    const camp = this.campamento();
    if (!camp) return;

    const dto: UpdateParticipanteAutorizacionDto = {
      autorizacionEntregada: !participante.autorizacionEntregada,
    };
    this.state.updateParticipanteAutorizacion(camp.id, participante.id, dto).subscribe();
  }

  onRegistrarGasto(): void {
    const camp = this.campamento();
    if (!camp) return;

    this.personasApi
      .getAll()
      .pipe(
        switchMap((responsables) => {
          const dialogData: GastoCampamentoDialogData = {
            campamentoId: camp.id,
            responsables,
          };
          return this.openGastoDialog(dialogData);
        }),
        switchMap((dialogRef) => dialogRef.afterClosed()),
      )
      .subscribe((result: GastoCampamentoDialogResult | undefined) => {
        if (!result) return;
        this.state.registrarGasto(camp.id, result.dto).subscribe();
      });
  }

  private openGastoDialog(dialogData: GastoCampamentoDialogData) {
    return from(
      import('../../shared/gasto-campamento-dialog/gasto-campamento-dialog.component').then(
        ({ GastoCampamentoDialogComponent }) => {
          return this.dialog.open(GastoCampamentoDialogComponent, {
            width: '640px',
            maxWidth: '90vw',
            data: dialogData,
            disableClose: false,
          });
        },
      ),
    );
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

  private openBonificarDialog(dialogData: BonificarParticipanteDialogData) {
    return from(
      import('../../shared/bonificar-participante-dialog/bonificar-participante-dialog.component').then(
        ({ BonificarParticipanteDialogComponent }) => {
          return this.dialog.open(BonificarParticipanteDialogComponent, {
            width: '480px',
            maxWidth: '90vw',
            data: dialogData,
            disableClose: false,
          });
        },
      ),
    );
  }

  private openPersonaSelectorDialog(dialogData: PersonaSelectorDialogData) {
    return from(
      import('../../../../../shared/components/persona-selector-dialog/persona-selector-dialog.component').then(
        ({ PersonaSelectorDialogComponent }) => {
          return this.dialog.open(PersonaSelectorDialogComponent, {
            width: '480px',
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
        // Mixed payment: montoPagado (cash/transfer) + montoConSaldoPersonal (personal account)
        const dto: RegistrarPagoCampamentoDto = {
          montoPagado: result.data.montoPagado,
          montoConSaldoPersonal: result.data.montoConSaldoPersonal || undefined,
          medioPago: result.data.medioPago,
          descripcion: result.data.descripcion,
        };
        this.state.registrarPago(campamentoId, participanteId, dto).subscribe();
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
