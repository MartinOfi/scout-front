/**
 * Reportes State Service
 * Gestiona estado de reportes con Signals
 * SIN any - tipado estricto
 */

import { Injectable, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, throwError } from 'rxjs';

import { NotificationService } from '../../../shared/services';

// TODO: Mover a models cuando se creen las interfaces de reporte
interface ReporteBase {
  id: string;
  tipo: string;
  fechaGeneracion: Date;
}

interface FiltrosReporte {
  fechaInicio?: Date;
  fechaFin?: Date;
  [key: string]: unknown;
}

type TipoReporte = 'DEUDAS' | 'REEMBOLSOS' | 'CAJA' | 'COMPROBANTES' | 'EVENTOS';

@Injectable({
  providedIn: 'root',
})
export class ReportesStateService {
  private readonly notificationService = inject(NotificationService);
  // TODO: private readonly apiService = inject(ReportesApiService);

  // ============================================================================
  // State Signals (private - writable)
  // ============================================================================

  private readonly _reporteActual: WritableSignal<ReporteBase | null> = signal(null);
  private readonly _filtrosReporte: WritableSignal<FiltrosReporte> = signal({});
  private readonly _loading: WritableSignal<boolean> = signal(false);
  private readonly _error: WritableSignal<string | null> = signal(null);

  // ============================================================================
  // Public Readonly Signals
  // ============================================================================

  readonly reporteActual: Signal<ReporteBase | null> = this._reporteActual.asReadonly();
  readonly filtrosReporte: Signal<FiltrosReporte> = this._filtrosReporte.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  // ============================================================================
  // Computed Signals (derived state)
  // ============================================================================

  readonly tieneReporte = computed((): boolean => {
    return this._reporteActual() !== null;
  });

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Generar un reporte
   * TODO: Implementar llamada a API cuando exista ReportesApiService
   */
  generarReporte(tipo: TipoReporte, filtros: FiltrosReporte): void {
    this._loading.set(true);
    this._error.set(null);
    this._filtrosReporte.set(filtros);

    // TODO: Implementar llamada real al backend
    console.warn('ReportesApiService no implementado aún');
    
    // Simulación temporal
    const reporteSimulado: ReporteBase = {
      id: 'temp-id',
      tipo,
      fechaGeneracion: new Date(),
    };
    
    this._reporteActual.set(reporteSimulado);
    this._loading.set(false);
  }

  /**
   * Exportar reporte actual a PDF
   * TODO: Implementar cuando exista endpoint
   */
  exportarPDF(): Observable<Blob> {
    // TODO: Implementar llamada real
    console.warn('Exportación PDF no implementada aún');
    return of(new Blob());
  }

  /**
   * Exportar reporte actual a Excel
   * TODO: Implementar cuando exista endpoint
   */
  exportarExcel(): Observable<Blob> {
    // TODO: Implementar llamada real
    console.warn('Exportación Excel no implementada aún');
    return of(new Blob());
  }

  /**
   * Actualizar filtros del reporte
   */
  actualizarFiltros(filtros: FiltrosReporte): void {
    this._filtrosReporte.set({ ...this._filtrosReporte(), ...filtros });
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this._reporteActual.set(null);
    this._filtrosReporte.set({});
    this._loading.set(false);
    this._error.set(null);
  }
}
