import { Injectable } from '@angular/core';

/**
 * Status configuration service
 *
 * Provides status color configurations using project semantic colors.
 * Replaces the external ServiceStatusConfigService.
 *
 * Color palette (from stat-card):
 * - success: #2e7d32 / bg: #e8f5e9
 * - info: #1565c0 / bg: #e3f2fd
 * - warning: #ef6c00 / bg: #fff3e0
 * - danger: #c62828 / bg: #ffebee
 */
@Injectable({
  providedIn: 'root',
})
export class StatusConfigService {
  /**
   * Status to semantic color mapping
   */
  private readonly statusMap: Record<string, string> = {
    // Spanish status names
    activo: 'success',
    completado: 'success',
    confirmado: 'success',
    aprobado: 'success',
    pagado: 'success',
    pendiente: 'warning',
    'en progreso': 'info',
    'en curso': 'info',
    programado: 'info',
    cancelado: 'danger',
    rechazado: 'danger',
    error: 'danger',
    vencido: 'danger',

    // English status names (lowercase)
    active: 'success',
    completed: 'success',
    confirmed: 'success',
    approved: 'success',
    paid: 'success',
    pending: 'warning',
    'in progress': 'info',
    'in_progress': 'info',
    scheduled: 'info',
    cancelled: 'danger',
    canceled: 'danger',
    rejected: 'danger',
    expired: 'danger',

    // Enum-style status names
    ACTIVE: 'success',
    COMPLETED: 'success',
    CONFIRMED: 'success',
    APPROVED: 'success',
    PAID: 'success',
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    SCHEDULED: 'info',
    CANCELLED: 'danger',
    CANCELED: 'danger',
    REJECTED: 'danger',
    ERROR: 'danger',
    EXPIRED: 'danger',
  };

  /**
   * CSS styles for each semantic color
   */
  private readonly colorStyles: Record<
    string,
    { text: string; bg: string; border: string }
  > = {
    success: {
      text: '#2e7d32',
      bg: '#e8f5e9',
      border: '#a5d6a7',
    },
    info: {
      text: '#1565c0',
      bg: '#e3f2fd',
      border: '#90caf9',
    },
    warning: {
      text: '#ef6c00',
      bg: '#fff3e0',
      border: '#ffcc80',
    },
    danger: {
      text: '#c62828',
      bg: '#ffebee',
      border: '#ef9a9a',
    },
    default: {
      text: '#616161',
      bg: '#f5f5f5',
      border: '#e0e0e0',
    },
  };

  /**
   * Tailwind-style class mappings
   */
  private readonly tailwindClasses: Record<string, string> = {
    success: 'text-green-800 bg-green-100 border-green-200',
    info: 'text-blue-800 bg-blue-100 border-blue-200',
    warning: 'text-yellow-800 bg-yellow-100 border-yellow-200',
    danger: 'text-red-800 bg-red-100 border-red-200',
    default: 'text-gray-800 bg-gray-100 border-gray-200',
  };

  /**
   * Resolves a status string to a normalized status key
   */
  resolveServiceStatus(status: string | null | undefined): string | null {
    if (!status) return null;

    const normalized = status.toString().toLowerCase().trim();
    const mapped = this.statusMap[normalized] || this.statusMap[status];

    return mapped || null;
  }

  /**
   * Gets CSS styles for a status
   */
  getStyles(
    status: string | null,
    format: 'tailwind' | 'css' = 'tailwind'
  ): string {
    const semantic = this.resolveServiceStatus(status) || 'default';
    const colorKey = this.statusMap[semantic] || semantic;

    if (format === 'tailwind') {
      return this.tailwindClasses[colorKey] || this.tailwindClasses['default'];
    }

    const styles = this.colorStyles[colorKey] || this.colorStyles['default'];
    return `color: ${styles.text}; background-color: ${styles.bg}; border-color: ${styles.border};`;
  }

  /**
   * Gets Tailwind soft classes (text + bg) for a status
   */
  getTailwindSoftClasses(status: string | null): string {
    return this.getStyles(status, 'tailwind');
  }

  /**
   * Gets the semantic color name for a status
   */
  getSemanticColor(status: string | null): string {
    if (!status) return 'default';
    return this.resolveServiceStatus(status) || 'default';
  }
}
