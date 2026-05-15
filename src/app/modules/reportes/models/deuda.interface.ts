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
  rama: string;
  deudaTotal: number;
  campamentos: CampamentoDeuda[];
  inscripcionesGrupo: InscripcionDeuda[];
  inscripcionesScout: InscripcionDeuda[];
  cuotas: CuotaDeuda[];
  documentacionPersonal: DocumentacionPersonal;
  documentacionInscripcion: DocInscripcion[];
}

export interface DeudaFilters {
  rama?: string;
  ano?: number;
}
