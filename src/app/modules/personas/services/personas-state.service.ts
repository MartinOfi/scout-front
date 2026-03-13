/**
 * Personas State Service
 * Gestiona estado con Signals (Angular 21)
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';

import {
  Persona,
  Protagonista,
  Educador,
  PersonaExterna,
  PersonaUnion,
  CreateProtagonistaDto,
  CreateEducadorDto,
  CreatePersonaExternaDto,
  UpdatePersonaDto,
} from '../../../shared/models';
import { PersonaDashboardDto } from '../models';

import { PersonasApiService } from './personas-api.service';
import { NotificationService } from '../../../shared/services';
import { PersonaType } from '../../../shared/enums';

@Injectable({
  providedIn: 'root',
})
export class PersonasStateService {
  private readonly apiService = inject(PersonasApiService);
  private readonly notificationService = inject(NotificationService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _protagonistas: WritableSignal<Protagonista[]> = signal([]);
  private readonly _educadores: WritableSignal<Educador[]> = signal([]);
  private readonly _personasExternas: WritableSignal<PersonaExterna[]> = signal([]);
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);
  private readonly _selectedId: WritableSignal<string | null> = signal(null);

  // Dashboard state
  private readonly _dashboard: WritableSignal<PersonaDashboardDto | null> = signal(null);
  private readonly _dashboardLoading: WritableSignal<boolean> = signal(false);
  private readonly _dashboardError: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly protagonistas: Signal<Protagonista[]> = this._protagonistas.asReadonly();
  readonly educadores: Signal<Educador[]> = this._educadores.asReadonly();
  readonly personasExternas: Signal<PersonaExterna[]> = this._personasExternas.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // Dashboard public signals
  readonly dashboard: Signal<PersonaDashboardDto | null> = this._dashboard.asReadonly();
  readonly dashboardLoading: Signal<boolean> = this._dashboardLoading.asReadonly();
  readonly dashboardError: Signal<string | null> = this._dashboardError.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly selected = computed((): PersonaUnion | null => {
    const id = this._selectedId();
    if (!id) return null;

    const inProtagonistas = this._protagonistas().find((p) => p.id === id);
    if (inProtagonistas) return inProtagonistas;

    const inEducadores = this._educadores().find((e) => e.id === id);
    if (inEducadores) return inEducadores;

    const inExternas = this._personasExternas().find((e) => e.id === id);
    if (inExternas) return inExternas;

    return null;
  });

  readonly allPersonas = computed((): PersonaUnion[] => {
    return [...this._protagonistas(), ...this._educadores(), ...this._personasExternas()];
  });

  readonly totalCount = computed((): number => {
    return this.allPersonas().length;
  });

  readonly protagonistaCount = computed((): number => {
    return this._protagonistas().length;
  });

  readonly educadorCount = computed((): number => {
    return this._educadores().length;
  });

  readonly personasExternasCount = computed((): number => {
    return this._personasExternas().length;
  });

  // Dashboard computed
  readonly isProtagonista = computed((): boolean => {
    return this._dashboard()?.persona.tipo === PersonaType.PROTAGONISTA;
  });

  readonly isEducador = computed((): boolean => {
    return this._dashboard()?.persona.tipo === PersonaType.EDUCADOR;
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Cargar todas las personas
   */
  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.apiService.getAll().subscribe({
      next: (personas: PersonaUnion[]) => {
        const protagonistas: Protagonista[] = [];
        const educadores: Educador[] = [];
        const personasExternas: PersonaExterna[] = [];

        personas.forEach((persona) => {
          switch (persona.tipo) {
            case PersonaType.PROTAGONISTA:
              protagonistas.push(persona as Protagonista);
              break;
            case PersonaType.EDUCADOR:
              educadores.push(persona as Educador);
              break;
            case PersonaType.EXTERNA:
              personasExternas.push(persona as PersonaExterna);
              break;
          }
        });

        this._protagonistas.set(protagonistas);
        this._educadores.set(educadores);
        this._personasExternas.set(personasExternas);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar personas';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Crear un nuevo protagonista
   */
  createProtagonista(dto: CreateProtagonistaDto): Observable<Persona> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.createProtagonista(dto).pipe(
      tap((persona: Persona) => {
        this._protagonistas.update((prev) => [...prev, persona as Protagonista]);
        this._loading.set(false);
        this.notificationService.showSuccess('Protagonista creado exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear protagonista';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Crear un nuevo educador
   */
  createEducador(dto: CreateEducadorDto): Observable<Persona> {
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
      }),
    );
  }

  /**
   * Crear una nueva persona externa
   */
  createPersonaExterna(dto: CreatePersonaExternaDto): Observable<Persona> {
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
      }),
    );
  }

  /**
   * Actualizar una persona
   */
  update(id: string, dto: UpdatePersonaDto): Observable<PersonaUnion> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.update(id, dto).pipe(
      tap((persona: PersonaUnion) => {
        this._updateInState(persona);
        this._loading.set(false);
        this.notificationService.showSuccess('Persona actualizada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar persona';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Eliminar (soft delete) una persona
   */
  delete(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.delete(id).pipe(
      tap(() => {
        this._removeFromState(id);
        this._loading.set(false);
        this.notificationService.showSuccess('Persona eliminada exitosamente');
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar persona';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Dar de baja una persona (transferir saldo a caja de grupo)
   */
  darDeBaja(id: string): Observable<{ saldoTransferido: number }> {
    this._loading.set(true);
    this._error.set(null);

    return this.apiService.darDeBaja(id).pipe(
      tap((result: { saldoTransferido: number }) => {
        this._removeFromState(id);
        this._loading.set(false);
        this.notificationService.showSuccess(
          `Persona dada de baja. Saldo transferido: $${result.saldoTransferido}`,
        );
      }),
      catchError((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al dar de baja';
        this._error.set(errorMsg);
        this._loading.set(false);
        this.notificationService.showError(errorMsg);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Cargar dashboard de una persona
   * Incluye cuenta personal, inscripciones, cuotas, y movimientos
   */
  loadDashboard(personaId: string): void {
    this._dashboardLoading.set(true);
    this._dashboardError.set(null);

    this.apiService.getDashboard(personaId).subscribe({
      next: (dashboard: PersonaDashboardDto) => {
        this._dashboard.set(dashboard);
        this._dashboardLoading.set(false);
      },
      error: (err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar dashboard';
        this._dashboardError.set(errorMsg);
        this._dashboardLoading.set(false);
        this.notificationService.showError(errorMsg);
      },
    });
  }

  /**
   * Limpiar dashboard
   */
  clearDashboard(): void {
    this._dashboard.set(null);
    this._dashboardLoading.set(false);
    this._dashboardError.set(null);
  }

  /**
   * Seleccionar una persona
   */
  select(id: string | null): void {
    this._selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._protagonistas.set([]);
    this._educadores.set([]);
    this._personasExternas.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedId.set(null);
    this.clearDashboard();
  }

  // ============================================================================
  // Private helpers
  // ============================================================================

  private _updateInState(persona: PersonaUnion): void {
    switch (persona.tipo) {
      case PersonaType.PROTAGONISTA:
        this._protagonistas.update((prev) =>
          prev.map((p) => (p.id === persona.id ? (persona as Protagonista) : p)),
        );
        break;
      case PersonaType.EDUCADOR:
        this._educadores.update((prev) =>
          prev.map((e) => (e.id === persona.id ? (persona as Educador) : e)),
        );
        break;
      case PersonaType.EXTERNA:
        this._personasExternas.update((prev) =>
          prev.map((pe) => (pe.id === persona.id ? (persona as PersonaExterna) : pe)),
        );
        break;
    }
  }

  private _removeFromState(id: string): void {
    this._protagonistas.update((prev) => prev.filter((p) => p.id !== id));
    this._educadores.update((prev) => prev.filter((e) => e.id !== id));
    this._personasExternas.update((prev) => prev.filter((pe) => pe.id !== id));

    if (this._selectedId() === id) {
      this._selectedId.set(null);
    }
  }
}
