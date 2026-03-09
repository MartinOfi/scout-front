/**
 * Personas Externas State Service
 * Gestiona estado de personas externas con Signals
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';

import { Persona, PersonaExterna, CreatePersonaExternaDto, UpdatePersonaDto, ReembolsoPendiente } from '../../../shared/models';
import { PersonaType } from '../../../shared/enums';
import { PersonasApiService } from './personas-api.service';
import { NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class PersonasExternasStateService {
  private readonly apiService = inject(PersonasApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _personasExternas: WritableSignal<PersonaExterna[]> = signal([]);
  private readonly _reembolsosPendientes: WritableSignal<ReembolsoPendiente[]> = signal([]);
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly personasExternas: Signal<PersonaExterna[]> = this._personasExternas.asReadonly();
  readonly reembolsosPendientes: Signal<ReembolsoPendiente[]> = this._reembolsosPendientes.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): PersonaExterna | null => {
    const id = this._selectedId();
    if (!id) return null;
    return this._personasExternas().find((pe) => pe.id === id) || null;
  });

  readonly totalCount = computed((): number => {
    return this._personasExternas().length;
  });

  readonly totalPendiente = computed((): number => {
    return this._reembolsosPendientes().reduce((sum, r) => sum + r.totalPendiente, 0);
  });

  readonly personasConDeuda = computed((): PersonaExterna[] => {
    const idsConDeuda = new Set(this._reembolsosPendientes().map(r => r.personaId));
    return this._personasExternas().filter(pe => idsConDeuda.has(pe.id));
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todas las personas externas
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (personas) => {
        const personasExternas = personas.filter((p) => p.tipo === PersonaType.EXTERNA) as PersonaExterna[];
        this._personasExternas.set(personasExternas);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar personas externas';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Cargar reembolsos pendientes
   */
  loadReembolsosPendientes(): void {
    this._loading.set(true);
    
    // TODO: Implementar endpoint específico en el backend
    // Por ahora, simulamos con movimientos pendientes
    this._loading.set(false);
  }

  /**
   * Crear una nueva persona externa
   */
  create(dto: CreatePersonaExternaDto): Observable<Persona> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.createPersonaExterna(dto).pipe(
      tap((persona: Persona) => {
        this._personasExternas.update((prev) => [...prev, persona as PersonaExterna]);
        this._loading.set(false);
        this.notificationService.showSuccess('Persona externa creada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear persona externa';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualizar una persona externa
   */
  update(id: string, dto: UpdatePersonaDto): Observable<Persona> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((persona: Persona) => {
        this._personasExternas.update((prev) =>
          prev.map((pe) => (pe.id === id ? (persona as PersonaExterna) : pe))
        );
        this._loading.set(false);
        this.notificationService.showSuccess('Persona externa actualizada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar persona externa';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Eliminar (soft delete) una persona externa
   */
  delete(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.delete(id).pipe(
      tap(() => {
        this._personasExternas.update((prev) => prev.filter((pe) => pe.id !== id));
        if (this._selectedId() === id) {
          this._selectedId.set(null);
        }
        this._loading.set(false);
        this.notificationService.showSuccess('Persona externa eliminada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar persona externa';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Seleccionar una persona externa
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._personasExternas.set([]);
    this._reembolsosPendientes.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
  }
}
