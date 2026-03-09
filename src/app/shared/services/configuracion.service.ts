/**
 * Configuracion Service
 * Manages localStorage-based configuration for inscription amounts
 * Uses Angular Signals for reactivity
 */

import { Injectable, signal, computed } from '@angular/core';
import { TipoInscripcion } from '../enums';

/**
 * Configuration interface for inscription amounts
 */
export interface InscripcionConfig {
  montoScoutArgentina: number;
  montoGrupo: number;
}

const DEFAULT_CONFIG: InscripcionConfig = {
  montoScoutArgentina: 0,
  montoGrupo: 0,
};

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  private readonly STORAGE_KEY = 'scout_inscripcion_config';

  // Private writable signal
  private readonly _config = signal<InscripcionConfig>(DEFAULT_CONFIG);

  // Public readonly computed signals
  readonly montoScoutArgentina = computed(() => this._config().montoScoutArgentina);
  readonly montoGrupo = computed(() => this._config().montoGrupo);
  readonly config = computed(() => this._config());

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Set monto for Scout Argentina inscription
   */
  setMontoScoutArgentina(monto: number): void {
    this._config.update((current) => ({
      ...current,
      montoScoutArgentina: monto,
    }));
    this.saveToStorage();
  }

  /**
   * Set monto for Grupo inscription
   */
  setMontoGrupo(monto: number): void {
    this._config.update((current) => ({
      ...current,
      montoGrupo: monto,
    }));
    this.saveToStorage();
  }

  /**
   * Get monto by inscription type
   */
  getMontoByTipo(tipo: TipoInscripcion): number {
    const config = this._config();
    return tipo === 'scout_argentina' ? config.montoScoutArgentina : config.montoGrupo;
  }

  /**
   * Update both amounts at once
   */
  updateConfig(config: Partial<InscripcionConfig>): void {
    this._config.update((current) => ({
      ...current,
      ...config,
    }));
    this.saveToStorage();
  }

  /**
   * Load configuration from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<InscripcionConfig>;
        this._config.set({
          montoScoutArgentina: parsed.montoScoutArgentina ?? 0,
          montoGrupo: parsed.montoGrupo ?? 0,
        });
      }
    } catch {
      // If parsing fails, use defaults
      this._config.set(DEFAULT_CONFIG);
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._config()));
    } catch {
      // localStorage might be full or disabled, silently fail
    }
  }
}
