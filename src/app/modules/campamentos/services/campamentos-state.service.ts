/**
 * Campamentos State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import {
  Campamento,
  CampamentoDetalleDto,
  CampamentoInfoDto,
  CampamentoKpisDto,
  ParticipantePagoDto,
  MovimientoCampamentoDto,
  PagoParticipante,
  CreateCampamentoDto,
  UpdateCampamentoDto,
  AddParticipanteDto,
  UpdateParticipanteAutorizacionDto,
  RegistrarPagoCampamentoDto,
  RegistrarGastoCampamentoDto,
  UpdatePagoDto,
  ResultadoPagoDto,
} from '../../../shared/models';
import { FiltroMovimientosCampamento } from '../../../shared/enums';

import { CampamentosApiService } from './campamentos-api.service';
import { ErrorHandlerService, NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class CampamentosStateService {
  private readonly apiService = inject(CampamentosApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _campamentos: WritableSignal<Campamento[]> = signal([]);
  private readonly _detalle: WritableSignal<CampamentoDetalleDto | null> = signal(null);
  private readonly _pagosPorParticipante: WritableSignal<Record<string, PagoParticipante[]>> =
    signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly campamentos: Signal<Campamento[]> = this._campamentos.asReadonly();
  readonly detalle: Signal<CampamentoDetalleDto | null> = this._detalle.asReadonly();
  readonly pagosPorParticipante: Signal<Record<string, PagoParticipante[]>> =
    this._pagosPorParticipante.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Campamento | null => {
    const id = this._selectedId();
    return this._campamentos().find((c) => c.id === id) ?? null;
  });

  readonly totalCampamentos = computed((): number => {
    return this._campamentos().length;
  });

  // Computed signals for easy access to detail parts
  readonly detalleInfo = computed((): CampamentoInfoDto | null => {
    return this._detalle()?.campamento ?? null;
  });

  readonly detalleParticipantes = computed((): ParticipantePagoDto[] => {
    return this._detalle()?.participantes ?? [];
  });

  readonly detalleMovimientos = computed((): MovimientoCampamentoDto[] => {
    return this._detalle()?.movimientos ?? [];
  });

  readonly detalleKpis = computed((): CampamentoKpisDto | null => {
    return this._detalle()?.kpis ?? null;
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todos los campamentos
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (campamentos: Campamento[]) => {
        this._campamentos.set(campamentos);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al cargar campamentos'));
        this._loading.set(false);
      },
    });
  }

  /**
   * Cargar detalle consolidado de un campamento
   * Incluye: info, participantes con estado de pagos, movimientos filtrados y KPIs
   * Los KPIs siempre se calculan sobre todos los movimientos (backend)
   */
  loadDetalle(
    id: string,
    filtro: FiltroMovimientosCampamento = FiltroMovimientosCampamento.TODOS,
  ): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedId.set(id);

    this.apiService.getDetalle(id, filtro).subscribe({
      next: (detalle: CampamentoDetalleDto) => {
        this._detalle.set(detalle);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(
          this.errorHandler.extractMessage(err, 'Error al cargar detalle del campamento'),
        );
        this._loading.set(false);
      },
    });
  }

  /**
   * Crear un nuevo campamento
   */
  create(dto: CreateCampamentoDto): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.create(dto).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) => [...prev, campamento]);
        this.notificationService.showSuccess('Campamento creado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al crear campamento'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar un campamento (PATCH)
   */
  update(id: string, dto: UpdateCampamentoDto): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) => prev.map((c) => (c.id === id ? campamento : c)));
        this.notificationService.showSuccess('Campamento actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al actualizar campamento'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Agregar un participante al campamento
   */
  addParticipante(campamentoId: string, dto: AddParticipanteDto): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.addParticipante(campamentoId, dto).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) =>
          prev.map((c) => (c.id === campamentoId ? campamento : c)),
        );
        this.notificationService.showSuccess('Participante agregado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al agregar participante'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Remover un participante del campamento
   */
  removeParticipante(campamentoId: string, personaId: string): Observable<Campamento> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.removeParticipante(campamentoId, personaId).pipe(
      tap((campamento: Campamento) => {
        this._campamentos.update((prev) =>
          prev.map((c) => (c.id === campamentoId ? campamento : c)),
        );
        this.notificationService.showSuccess('Participante removido exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al remover participante'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateParticipanteAutorizacion(
    campamentoId: string,
    personaId: string,
    dto: UpdateParticipanteAutorizacionDto,
  ): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.updateParticipanteAutorizacion(campamentoId, personaId, dto).pipe(
      tap(() => {
        this.loadDetalle(campamentoId);
        this.notificationService.showSuccess('Autorización actualizada exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al actualizar autorización'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Registrar un pago para campamento
   * POST /api/v1/campamentos/:id/pagos/:personaId
   * Supports mixed payments (cash/transfer + personal account balance)
   */
  registrarPago(
    campamentoId: string,
    personaId: string,
    dto: RegistrarPagoCampamentoDto,
  ): Observable<ResultadoPagoDto> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarPago(campamentoId, personaId, dto).pipe(
      tap(() => {
        this.loadDetalle(campamentoId);
        this.notificationService.showSuccess('Pago registrado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al registrar pago'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Registrar un gasto para campamento
   */
  registrarGasto(campamentoId: string, dto: RegistrarGastoCampamentoDto): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.registrarGasto(campamentoId, dto).pipe(
      tap(() => {
        this.loadDetalle(campamentoId);
        this.notificationService.showSuccess('Gasto registrado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al registrar gasto'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Actualizar un pago existente
   * PATCH /api/v1/campamentos/:id/pagos/:movimientoId
   */
  updatePago(campamentoId: string, movimientoId: string, dto: UpdatePagoDto): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.updatePago(campamentoId, movimientoId, dto).pipe(
      tap(() => {
        this.loadDetalle(campamentoId);
        this.notificationService.showSuccess('Pago actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al actualizar pago'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Eliminar un pago existente
   * DELETE /api/v1/campamentos/:id/pagos/:movimientoId
   */
  deletePago(campamentoId: string, movimientoId: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.deletePago(campamentoId, movimientoId).pipe(
      tap(() => {
        this.loadDetalle(campamentoId);
        this.notificationService.showSuccess('Pago eliminado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al eliminar pago'));
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  /**
   * Eliminar un campamento (soft delete)
   * No setea loading/error global para no bloquear la UI
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete(id).pipe(
      tap(() => {
        this._campamentos.update((prev) => prev.filter((c) => c.id !== id));
        this.notificationService.showSuccess('Campamento eliminado exitosamente');
      }),
      catchError((err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al eliminar campamento'));
        return throwError(() => err);
      }),
    );
  }

  /**
   * Cargar pagos por participante de un campamento
   */
  loadPagosPorParticipante(campamentoId: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getPagosPorParticipante(campamentoId).subscribe({
      next: (pagos: PagoParticipante[]) => {
        this._pagosPorParticipante.update((prev) => ({
          ...prev,
          [campamentoId]: pagos,
        }));
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al cargar pagos'));
        this._loading.set(false);
      },
    });
  }

  /**
   * Cargar un campamento por ID
   * Carga el campamento y su resumen financiero
   */
  loadById(id: string): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedId.set(id);

    this.apiService.getById(id).subscribe({
      next: (campamento: Campamento) => {
        // Update or add to campamentos array
        this._campamentos.update((prev) => {
          const exists = prev.some((c) => c.id === id);
          if (exists) {
            return prev.map((c) => (c.id === id ? campamento : c));
          }
          return [...prev, campamento];
        });
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(this.errorHandler.extractMessage(err, 'Error al cargar campamento'));
        this._loading.set(false);
      },
    });
  }

  /**
   * Seleccionar un campamento
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._campamentos.set([]);
    this._detalle.set(null);
    this._pagosPorParticipante.set({});
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
  }
}
