/**
 * Educadores State Service
 * Gestiona estado de educadores con Signals
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';

import { Persona, Educador, CreateEducadorDto, UpdatePersonaDto } from '../../../shared/models';
import { PersonasApiService } from './personas-api.service';
import { NotificationService } from '../../../shared/services';

@Injectable({
  providedIn: 'root',
})
export class EducadoresStateService {
  private readonly apiService = inject(PersonasApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _educadores: WritableSignal<Educador[]> = signal([]);
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly educadores: Signal<Educador[]> = this._educadores.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): Educador | null => {
    const id = this._selectedId();
    if (!id) return null;
    return this._educadores().find((e) => e.id === id) || null;
  });

  readonly totalCount = computed((): number => {
    return this._educadores().length;
  });

  readonly educadoresActivos = computed((): Educador[] => {
    return this._educadores().filter((e) => e.estado === 'activo');
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todos los educadores
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (personas) => {
        const educadores = personas.filter((p) => p.tipo === 'educador') as Educador[];
        this._educadores.set(educadores);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar educadores';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear un nuevo educador
   */
  create(dto: CreateEducadorDto): Observable<Persona> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.createEducador(dto).pipe(
      tap((persona: Persona) => {
        this._educadores.update((prev) => [...prev, persona as Educador]);
        this._loading.set(false);
        this.notificationService.showSuccess('Educador creado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear educador';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualizar un educador
   */
  update(id: string, dto: UpdatePersonaDto): Observable<Persona> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((persona: Persona) => {
        this._educadores.update((prev) =>
          prev.map((e) => (e.id === id ? (persona as Educador) : e))
        );
        this._loading.set(false);
        this.notificationService.showSuccess('Educador actualizado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar educador';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Eliminar (soft delete) un educador
   */
  delete(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.delete(id).pipe(
      tap(() => {
        this._educadores.update((prev) => prev.filter((e) => e.id !== id));
        if (this._selectedId() === id) {
          this._selectedId.set(null);
        }
        this._loading.set(false);
        this.notificationService.showSuccess('Educador eliminado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar educador';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Seleccionar un educador
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._educadores.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
  }
}
