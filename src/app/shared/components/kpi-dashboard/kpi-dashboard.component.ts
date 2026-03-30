/**
 * KPI Dashboard Component
 * Comprehensive dashboard for displaying inscripciones consolidado data
 */

import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InscripcionesConsolidado, DistribucionPorRama, ResumenFinanciero } from '../../models';

/** Rama configuration for display */
interface RamaConfig {
  readonly key: keyof Omit<DistribucionPorRama, 'total'>;
  readonly label: string;
  readonly color: string;
  readonly icon: string;
}

/** Financial metric configuration */
interface FinancialMetric {
  readonly key: keyof ResumenFinanciero;
  readonly label: string;
  readonly icon: string;
  readonly variant: 'success' | 'info' | 'warning' | 'danger';
}

/** Debtor category configuration */
interface DebtorCategory {
  readonly key: 'dinero' | 'documentacion' | 'ambos';
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly variant: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, CurrencyPipe, DecimalPipe],
  templateUrl: './kpi-dashboard.component.html',
  styleUrl: './kpi-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiDashboardComponent {
  /** Consolidado data from backend */
  readonly consolidado = input.required<InscripcionesConsolidado | null>();

  /** Loading state */
  readonly loading = input<boolean>(false);

  /** Rama configurations */
  readonly ramaConfigs: readonly RamaConfig[] = [
    { key: 'manada', label: 'Manada', color: '#f59e0b', icon: 'pets' },
    { key: 'unidad', label: 'Unidad', color: '#10b981', icon: 'explore' },
    { key: 'caminantes', label: 'Caminantes', color: '#3b82f6', icon: 'hiking' },
    { key: 'rovers', label: 'Rovers', color: '#8b5cf6', icon: 'landscape' },
    { key: 'educadores', label: 'Educadores', color: '#812128', icon: 'school' },
  ];

  /** Financial metric configurations */
  readonly financialMetrics: readonly FinancialMetric[] = [
    { key: 'montoEsperado', label: 'Monto Esperado', icon: 'account_balance', variant: 'info' },
    { key: 'montoPagado', label: 'Monto Pagado', icon: 'payments', variant: 'success' },
    { key: 'montoAdeudado', label: 'Monto Adeudado', icon: 'warning', variant: 'warning' },
    { key: 'montoBonificado', label: 'Bonificado', icon: 'discount', variant: 'danger' },
  ];

  /** Debtor category configurations */
  readonly debtorCategories: readonly DebtorCategory[] = [
    {
      key: 'dinero',
      label: 'Deuda de Dinero',
      description: 'Personas con saldo pendiente',
      icon: 'attach_money',
      variant: 'warning',
    },
    {
      key: 'documentacion',
      label: 'Documentación',
      description: 'Documentos faltantes',
      icon: 'description',
      variant: 'info',
    },
    {
      key: 'ambos',
      label: 'Dinero + Docs',
      description: 'Ambos tipos de deuda',
      icon: 'error_outline',
      variant: 'danger',
    },
  ];

  /** Computed: distribution data for rama chart */
  readonly ramaDistribution = computed(() => {
    const data = this.consolidado();
    if (!data) return [];

    const total = data.total || 1;
    return this.ramaConfigs.map((rama) => {
      const count = data.porRama[rama.key];
      const percentage = (count / total) * 100;
      return {
        ...rama,
        count,
        percentage,
        formattedPercentage: percentage.toFixed(1),
      };
    });
  });

  /** Computed: financial data with percentages */
  readonly financialData = computed(() => {
    const data = this.consolidado();
    if (!data) return [];

    const esperado = data.financiero.montoEsperado || 1;
    return this.financialMetrics.map((metric) => {
      const value = data.financiero[metric.key];
      const percentage = metric.key === 'montoEsperado' ? 100 : (value / esperado) * 100;
      return {
        ...metric,
        value,
        percentage: Math.min(percentage, 100),
      };
    });
  });

  /** Computed: payment progress percentage */
  readonly paymentProgress = computed(() => {
    const data = this.consolidado();
    if (!data || !data.financiero.montoEsperado) return 0;
    return (data.financiero.montoPagado / data.financiero.montoEsperado) * 100;
  });

  /** Computed: debtors data */
  readonly debtorsData = computed(() => {
    const data = this.consolidado();
    if (!data) return [];

    const total = data.total || 1;
    return this.debtorCategories.map((category) => {
      let count: number;
      let porRama: DistribucionPorRama | undefined;
      let monto: number | undefined;

      if (category.key === 'dinero') {
        count = data.deudores.dinero.total;
        porRama = data.deudores.dinero.porRama;
        monto = data.deudores.dinero.monto;
      } else if (category.key === 'documentacion') {
        count = data.deudores.documentacion.total;
        porRama = data.deudores.documentacion.porRama;
      } else {
        count = data.deudores.ambos.total;
        porRama = data.deudores.ambos;
      }

      const percentage = (count / total) * 100;
      return {
        ...category,
        count,
        percentage,
        porRama,
        monto,
      };
    });
  });

  /** Get rama breakdown for a debtor category */
  getRamaBreakdown(porRama: DistribucionPorRama | undefined): { label: string; count: number }[] {
    if (!porRama) return [];
    return this.ramaConfigs
      .map((rama) => ({
        label: rama.label,
        count: porRama[rama.key],
      }))
      .filter((item) => item.count > 0);
  }
}
