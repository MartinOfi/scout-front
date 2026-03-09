/**
 * Interfaz de configuración para filtros genéricos
 *
 * Basado en las especificaciones del todo.md líneas 25-42
 * Define la estructura de configuración para filtros reutilizables
 */

import { ChipConfig } from "../chips-filter/chip-config.interface";
import { FilterOption } from "./filter-option.interface";
import { FilterType } from "./filter-type.enum";


/**
 * Interfaz de configuración para un filtro individual
 *
 * Permite definir dinámicamente qué tipo de filtro mostrar,
 * sus opciones, validación y comportamiento
 */
export interface FilterConfig {
  /** Clave única del filtro */
  key: string;

  /** Tipo de filtro a renderizar */
  type: FilterType;

  /** Etiqueta visible del filtro */
  label: string;

  /** Texto de placeholder (opcional) */
  placeholder?: string;

  /** Opciones disponibles para el filtro (opcional) */
  options?: FilterOption[];

  /** Reglas de validación (opcional) */
  validation?: ValidationRule[];

  /** Valor por defecto del filtro (opcional) */
  defaultValue?: any;

  /** Si el filtro es requerido (opcional) */
  required?: boolean;

  /** Si el filtro está deshabilitado (opcional) */
  disabled?: boolean;

  /** Si permite selección múltiple (opcional) */
  multiple?: boolean;

  /** Si es searchable (opcional) */
  searchable?: boolean;

  /** Componente personalizado (opcional) */
  customComponent?: string;

  /** Configuración de chips (requerido si type === CHIPS) */
  chips?: ChipConfig[];

  /** Nombre del servicio de configuración para chips (opcional) */
  chipConfigService?: string;

  /** Para chips, permite selección múltiple (opcional) */
  allowMultiple?: boolean;
}

/**
 * Interfaz para reglas de validación
 */
export interface ValidationRule {
  /** Tipo de validación */
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';

  /** Valor de la validación */
  value?: any;

  /** Mensaje de error personalizado */
  message?: string;

  /** Función de validación personalizada */
  validator?: (value: any) => boolean;
}
