import { PersonaType } from '../../../shared/enums';
import { TipoDeudaFilter } from '../constants/deuda.constants';

export interface CampamentoDeuda {
  campamentoId: string;
  nombre: string;
  ano: number;
  montoTotal: number;
  montoPagado: number;
  saldo: number;
  autorizacionEntregada: boolean;
}

export interface InscripcionDeuda {
  inscripcionId: string;
  tipo: string;
  ano: number;
  montoTotal: number;
  montoBonificado: number;
  montoPagado: number;
  saldo: number;
}

export interface CuotaDeuda {
  cuotaId: string;
  nombre: string;
  ano: number;
  montoTotal: number;
  montoPagado: number;
  saldo: number;
}

export interface DocumentacionPersonal {
  dni: boolean;
  partidaNacimiento: boolean;
  dniPadres: boolean;
  carnetObraSocial: boolean;
}

export interface DocInscripcion {
  inscripcionId: string;
  ano: number;
  declaracionDeSalud: boolean;
  autorizacionDeImagen: boolean;
  salidasCercanas: boolean;
  autorizacionIngreso: boolean;
  certificadoAptitudFisica: boolean;
}

export interface PersonaDeuda {
  personaId: string;
  nombre: string;
  /** Define a qué ficha enlaza la fila (protagonista o educador). */
  tipo: PersonaType;
  rama: string;
  /** Mayor de edad (Educador o Rovers): no entrega DNI de los padres. */
  esMayorDeEdad: boolean;
  deudaTotal: number;
  campamentos: CampamentoDeuda[];
  inscripcionesGrupo: InscripcionDeuda[];
  inscripcionesScout: InscripcionDeuda[];
  cuotas: CuotaDeuda[];
  /** null para educadores (no tienen documentación personal). */
  documentacionPersonal: DocumentacionPersonal | null;
  documentacionInscripcion: DocInscripcion[];
}

/** Filtros del reporte de deudas. Los tres se resuelven en el backend. */
export interface DeudaFilters {
  /** Rama, o `Educadores` para ver solo educadores. */
  rama?: string;
  ano?: number;
  tipo?: TipoDeudaFilter;
}
