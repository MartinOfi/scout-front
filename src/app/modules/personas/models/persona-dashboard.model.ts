/**
 * Persona Dashboard models
 * Typed interfaces for GET /personas/:id/dashboard endpoint
 * SIN any - tipado estricto
 */

import {
  PersonaType,
  EstadoPersona,
  Rama,
  CargoEducador,
  TipoInscripcion,
  EstadoInscripcion,
  EstadoCuota,
  MedioPago,
  ConceptoMovimiento,
} from '../../../shared/enums';

// =============================================================================
// PERSONA DASHBOARD DTO (Main Response)
// =============================================================================

/**
 * Complete dashboard response for a persona
 * Aggregates all financial and membership data
 */
export interface PersonaDashboardDto {
  persona: PersonaDashboardPersona;
  cuentaPersonal: CuentaPersonalResumen;
  documentacionPersonal?: DocumentacionPersonal;
  inscripciones: InscripcionesResumen;
  cuotas: CuotasResumen;
  deudaTotal: DeudaTotal;
  ultimosMovimientos: MovimientoDashboard[];
}

// =============================================================================
// PERSONA SECTION
// =============================================================================

/**
 * Persona info for dashboard header
 */
export interface PersonaDashboardPersona {
  id: string;
  nombre: string;
  tipo: PersonaType;
  estado: EstadoPersona;
  rama: Rama | null;
  cargo?: CargoEducador;
}

// =============================================================================
// CUENTA PERSONAL SECTION
// =============================================================================

/**
 * Personal account summary
 */
export interface CuentaPersonalResumen {
  id: string;
  saldo: number;
}

// =============================================================================
// DOCUMENTACIÓN PERSONAL SECTION (Protagonistas only)
// =============================================================================

/**
 * Documentation checklist for Protagonistas
 */
export interface DocumentacionPersonal {
  partidaNacimiento: boolean;
  dni: boolean;
  dniPadres: boolean;
  carnetObraSocial: boolean;
}

// =============================================================================
// INSCRIPCIONES SECTION
// =============================================================================

/**
 * Inscripciones summary with items
 */
export interface InscripcionesResumen {
  total: number;
  pagadas: number;
  pendientes: number;
  deudaTotal: number;
  items: InscripcionDashboardItem[];
}

/**
 * Single inscription item for dashboard list
 */
export interface InscripcionDashboardItem {
  id: string;
  tipo: TipoInscripcion;
  ano: number;
  estado: EstadoInscripcion;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
}

// =============================================================================
// CUOTAS SECTION
// =============================================================================

/**
 * Cuotas summary with items
 */
export interface CuotasResumen {
  total: number;
  pagadas: number;
  pendientes: number;
  deudaTotal: number;
  items: CuotaDashboardItem[];
}

/**
 * Single cuota item for dashboard list
 */
export interface CuotaDashboardItem {
  id: string;
  nombre: string;
  ano: number;
  estado: EstadoCuota;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
}

// =============================================================================
// DEUDA TOTAL SECTION
// =============================================================================

/**
 * Consolidated debt information
 */
export interface DeudaTotal {
  total: number;
  inscripciones: number;
  cuotas: number;
}

// =============================================================================
// MOVIMIENTOS SECTION
// =============================================================================

/**
 * Movimiento for dashboard timeline (simplified)
 */
export interface MovimientoDashboard {
  id: string;
  fecha: string;
  monto: number;
  concepto: ConceptoMovimiento;
  medioPago: MedioPago;
  descripcion: string | null;
}
