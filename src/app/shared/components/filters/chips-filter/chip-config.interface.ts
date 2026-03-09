/**
 * Interfaz para configuración de chips genéricos
 *
 * Basado en las especificaciones del todo.md líneas 92-102
 * Define la estructura de configuración para chips reutilizables
 */

/**
 * Interfaz de configuración para un chip individual
 *
 * Permite definir dinámicamente el valor, label, colores e icono de un chip
 */
export interface ChipConfig {
  /** Valor del chip (string, number o null para "Todos") */
  value: string | number | null;

  /** Label a mostrar en el chip */
  label: string;

  /** Color de fondo del chip (opcional) */
  backgroundColor?: string;

  /** Color de texto del chip (opcional) */
  textColor?: string;

  /** Nombre del icono Material a mostrar (opcional) */
  icon?: string;

  /** Si el chip está deshabilitado (opcional) */
  disabled?: boolean;
}

