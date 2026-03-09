/**
 * Utilidades para manejo de tiempo
 *
 * Basado en las especificaciones del todo.md líneas 108, 149
 * Utilidades para manejo de tiempo
 */

import { DayOfWeek } from '../enums/day-of-week.enum';

/**
 * Convierte un string HH:mm a objeto Date (usando fecha base 2000-01-01)
 */
export function parseTimeFromHHMM(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date('2000-01-01');
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Calcula la duración entre dos horas en minutos
 */
export function calculateDurationInMinutes(
  startTime: string,
  endTime: string
): number {
  const start = parseTimeFromHHMM(startTime);
  const end = parseTimeFromHHMM(endTime);

  // Si la hora de fin es menor que la de inicio, asumimos que es del día siguiente
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Formatea la duración en minutos a string legible
 */
export function formatDuration(durationInMinutes: number): string {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Obtiene el nombre del día en español
 */
export function getDayNameInSpanish(day: DayOfWeek): string {
  const dayNames: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'Lunes',
    [DayOfWeek.TUESDAY]: 'Martes',
    [DayOfWeek.WEDNESDAY]: 'Miércoles',
    [DayOfWeek.THURSDAY]: 'Jueves',
    [DayOfWeek.FRIDAY]: 'Viernes',
    [DayOfWeek.SATURDAY]: 'Sábado',
    [DayOfWeek.SUNDAY]: 'Domingo',
  };

  return dayNames[day] || day;
}

/**
 * Obtiene todos los días de la semana en orden
 */
export function getAllDaysInOrder(): DayOfWeek[] {
  return [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];
}

/**
 * Obtiene todos los días de la semana con sus labels en español
 */
export function getAllDaysWithLabels(): {
  value: DayOfWeek;
  label: string;
}[] {
  return getAllDaysInOrder().map((day) => ({
    value: day,
    label: getDayNameInSpanish(day),
  }));
}

/**
 * Formatear fecha a formato dd/mm/yyyy
 * @param dateString Fecha en formato ISO (YYYY-MM-DD)
 * @returns Fecha formateada como dd/mm/yyyy
 */
export function formatDateToDDMMYYYY(dateString: string): string {
  // Parsear fecha como UTC para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Usar métodos UTC para formatear
  const formattedDay = String(date.getUTCDate()).padStart(2, '0');
  const formattedMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const formattedYear = date.getUTCFullYear();

  return `${formattedDay}/${formattedMonth}/${formattedYear}`;
}

/**
 * Calcular el lunes y domingo de la semana que contiene una fecha dada
 * @param dateString Fecha en formato ISO (YYYY-MM-DD) o Date
 * @returns Objeto con startDate (lunes) y endDate (domingo) en formato ISO (YYYY-MM-DD)
 */
export function calculateWeekRange(dateString: string | Date): {
  startDate: string;
  endDate: string;
} {
  // Si es string, parsear como fecha UTC para evitar problemas de zona horaria
  let date: Date;
  if (typeof dateString === 'string') {
    // Parsear fecha en formato YYYY-MM-DD como UTC
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(Date.UTC(year, month - 1, day));
  } else {
    date = dateString;
  }

  // Obtener el día de la semana en UTC (0 = domingo, 1 = lunes, ..., 6 = sábado)
  const dayOfWeek = date.getUTCDay();

  // Calcular días hasta el lunes (si es domingo, retroceder 6 días; si no, retroceder dayOfWeek - 1)
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  // Crear fecha del lunes en UTC
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  // Crear fecha del domingo en UTC (lunes + 6 días)
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  // Formatear como YYYY-MM-DD usando UTC
  const formatDate = (d: Date): string => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
  };
}
