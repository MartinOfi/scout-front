/**
 * Constantes del reporte de deudas.
 * Single source of truth para los filtros de rama y tipo de deuda.
 */

import { RAMAS } from '../../../shared/enums';

/**
 * Valor del filtro de rama que devuelve solo educadores.
 * No es una rama real: el backend agrupa a los educadores bajo esta etiqueta
 * porque pueden tener rama asignada o no.
 * Debe coincidir con RAMA_EDUCADORES del backend.
 */
export const RAMA_FILTER_EDUCADORES = 'Educadores';

/** Valor de filtro vacío: "sin filtrar". */
export const FILTER_ALL = '';

/** Opciones del filtro de rama, incluyendo el grupo de educadores. */
export const RAMA_FILTER_OPTIONS = [
  { value: FILTER_ALL, label: 'Todas' },
  ...RAMAS.map((rama) => ({ value: rama as string, label: rama as string })),
  { value: RAMA_FILTER_EDUCADORES, label: 'Educadores' },
] as const;

/**
 * Tipos de deuda por los que se puede filtrar.
 * `DINERO` unifica todas las deudas monetarias (campamentos, inscripciones
 * Scout AR, inscripciones de grupo y cuotas) en una sola opción.
 */
export enum TipoDeudaFilter {
  TODOS = '',
  DINERO = 'dinero',
  CAMPAMENTOS = 'campamentos',
  INSCRIPCIONES_SCOUT = 'inscripcionesScout',
  INSCRIPCIONES_GRUPO = 'inscripcionesGrupo',
  CUOTAS = 'cuotas',
  DOCUMENTACION = 'documentacion',
}

export const TIPO_DEUDA_FILTER_LABELS: Readonly<Record<TipoDeudaFilter, string>> = {
  [TipoDeudaFilter.TODOS]: 'Todos',
  [TipoDeudaFilter.DINERO]: 'Dinero (todas)',
  [TipoDeudaFilter.CAMPAMENTOS]: 'Campamentos',
  [TipoDeudaFilter.INSCRIPCIONES_SCOUT]: 'Inscripciones Scout AR',
  [TipoDeudaFilter.INSCRIPCIONES_GRUPO]: 'Inscripciones Grupo',
  [TipoDeudaFilter.CUOTAS]: 'Cuotas',
  [TipoDeudaFilter.DOCUMENTACION]: 'Documentación',
} as const;

/** Opciones del filtro de tipo de deuda, derivadas del enum. */
export const TIPO_DEUDA_FILTER_OPTIONS = Object.values(TipoDeudaFilter).map((value) => ({
  value,
  label: TIPO_DEUDA_FILTER_LABELS[value],
}));

/** Claves de los filtros expuestos en la barra de filtros. */
export enum DeudaFilterKey {
  RAMA = 'rama',
  ANO = 'ano',
  TIPO = 'tipo',
}
