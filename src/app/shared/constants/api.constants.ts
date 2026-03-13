/**
 * API configuration constants
 * Centralized - NO hardcoded URLs
 * Uses environment configuration for BASE_URL
 */

import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  ENDPOINTS: {
    // Personas
    PERSONAS: 'personas',
    PROTAGONISTAS: 'personas/protagonistas',
    EDUCADORES: 'personas/educadores',
    PERSONAS_EXTERNAS: 'personas/externas',
    PERSONAS_CON_DEUDAS: 'personas/con-deudas',

    // Cajas
    CAJAS: 'cajas',
    CAJAS_GRUPO: 'cajas/grupo',
    CAJAS_CONSOLIDADO: 'cajas/consolidado',

    // Movimientos
    MOVIMIENTOS: 'movimientos',
    MOVIMIENTOS_SALDO: 'movimientos/saldo',
    MOVIMIENTOS_CAJA: 'movimientos/caja',
    MOVIMIENTOS_REEMBOLSOS_PENDIENTES: 'movimientos/reembolsos-pendientes',

    // Inscripciones
    INSCRIPCIONES: 'inscripciones',

    // Cuotas
    CUOTAS: 'cuotas',

    // Campamentos
    CAMPAMENTOS: 'campamentos',

    // Eventos
    EVENTOS: 'eventos',
  },
} as const;

/**
 * HTTP timeout configuration
 */
export const HTTP_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
