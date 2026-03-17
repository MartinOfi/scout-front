/**
 * Inscripcion models
 * Typed interfaces - NO any
 */

import {
  TipoInscripcion,
  EstadoInscripcion,
  MedioPago,
  TipoMovimiento,
  ConceptoMovimiento,
} from '../enums';
import { Persona } from './persona.model';

/**
 * Inscripcion (Scout group or Scout Argentina annual registration)
 * estado and montoPagado are calculated fields, returned by GET endpoints
 */
export interface Inscripcion {
  id: string;
  personaId: string;
  persona?: Persona;
  tipo: TipoInscripcion;
  ano: number;
  montoTotal: number;
  montoBonificado: number;
  declaracionDeSalud: boolean;
  autorizacionDeImagen: boolean;
  salidasCercanas: boolean;
  autorizacionIngreso: boolean;
  certificadoAptitudFisica: boolean;
  createdAt: string;
  updatedAt: string;
  // Calculated fields (returned by backend)
  estado?: EstadoInscripcion;
  montoPagado?: number;
  saldoPendiente?: number;
}

/**
 * Movimiento embedded in inscripcion detail response
 */
export interface MovimientoInscripcion {
  id: string;
  monto: number;
  medioPago: MedioPago;
  fecha: string;
  descripcion: string | null;
  tipo: TipoMovimiento;
  concepto: ConceptoMovimiento;
}

/**
 * Inscripcion with calculated payment state (returned by GET /:id)
 * Flat structure matching backend InscripcionResponseDto
 */
export interface InscripcionConEstado extends Inscripcion {
  estado: EstadoInscripcion;
  montoPagado: number;
  saldoPendiente: number;
  movimientos: MovimientoInscripcion[];
}

/**
 * DTO for creating an inscripcion
 */
export interface CreateInscripcionDto {
  personaId: string;
  tipo: TipoInscripcion;
  ano: number;
  montoTotal: number;
  montoBonificado?: number;
  montoPagado?: number;
  montoConSaldoPersonal?: number;
  medioPago?: MedioPago;
  declaracionDeSalud?: boolean;
  autorizacionDeImagen?: boolean;
  salidasCercanas?: boolean;
  autorizacionIngreso?: boolean;
  certificadoAptitudFisica?: boolean;
}

/**
 * DTO for updating an inscripcion
 */
export interface UpdateInscripcionDto {
  montoBonificado?: number;
  declaracionDeSalud?: boolean;
  autorizacionDeImagen?: boolean;
  salidasCercanas?: boolean;
  autorizacionIngreso?: boolean;
  certificadoAptitudFisica?: boolean;
}

// ============================================================================
// Consolidado Types (GET /inscripciones/consolidado)
// ============================================================================

/**
 * Tipo de deuda para filtrar inscripciones
 * - dinero: solo con saldo pendiente > 0
 * - documentacion: solo con documentos faltantes (Scout Argentina)
 * - ambos: con dinero Y documentación pendiente
 */
export type TipoDeuda = 'dinero' | 'documentacion' | 'ambos';

/**
 * Distribución por rama (breakdown de conteo)
 */
export interface DistribucionPorRama {
  readonly total: number;
  readonly manada: number;
  readonly unidad: number;
  readonly caminantes: number;
  readonly rovers: number;
  readonly educadores: number;
}

/**
 * Resumen financiero consolidado
 */
export interface ResumenFinanciero {
  readonly montoEsperado: number;
  readonly montoPagado: number;
  readonly montoAdeudado: number;
  readonly montoBonificado: number;
}

/**
 * Deuda de dinero con monto total
 */
export interface DeudaDinero {
  readonly total: number;
  readonly monto: number;
  readonly porRama: DistribucionPorRama;
}

/**
 * Deuda de documentación (solo Scout Argentina)
 */
export interface DeudaDocumentacion {
  readonly total: number;
  readonly porRama: DistribucionPorRama;
}

/**
 * Resumen de deudores agrupado
 */
export interface DeudoresResumen {
  readonly dinero: DeudaDinero;
  readonly documentacion: DeudaDocumentacion;
  readonly ambos: DistribucionPorRama;
}

/**
 * Filtros aplicados al consolidado (echo del backend)
 */
export interface FiltrosConsolidado {
  readonly ano?: number;
  readonly tipo?: TipoInscripcion;
  readonly tipoDeuda?: TipoDeuda;
}

/**
 * Respuesta del endpoint GET /inscripciones/consolidado
 */
export interface InscripcionesConsolidado {
  readonly filtros: FiltrosConsolidado;
  readonly total: number;
  readonly porRama: DistribucionPorRama;
  readonly financiero: ResumenFinanciero;
  readonly deudores: DeudoresResumen;
  readonly fecha: string;
}
