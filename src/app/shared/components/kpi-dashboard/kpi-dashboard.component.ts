/**
 * KPI Dashboard Component
 * Comprehensive dashboard for displaying inscripciones consolidado data
 * Features animated number counters, progress bars, and distribution charts
 */

import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  OnInit,
  signal,
  effect,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  InscripcionesConsolidado,
  DistribucionPorRama,
  ResumenFinanciero,
  DeudoresResumen,
} from '../../models';

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
export class KpiDashboardComponent implements OnInit {
  /** Consolidado data from backend */
  readonly consolidado = input.required<InscripcionesConsolidado | null>();

  /** Loading state */
  readonly loading = input<boolean>(false);

  /** Animated values for number ticker effect */
  readonly animatedTotal = signal(0);
  readonly animatedFinancial = signal<Record<string, number>>({
    montoEsperado: 0,
    montoPagado: 0,
    montoAdeudado: 0,
    montoBonificado: 0,
  });

  private readonly destroyRef = inject(DestroyRef);
  private animationFrameId: number | null = null;

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

  constructor() {
    // Animate numbers when consolidado changes
    effect(() => {
      const data = this.consolidado();
      if (data) {
        this.animateToValue(this.animatedTotal, data.total, 800);
        this.animateFinancialValues(data.financiero, 1000);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  ngOnInit(): void {
    // Initial animation handled by effect
  }

  /** Animate a signal value from current to target */
  private animateToValue(
    signalRef: ReturnType<typeof signal<number>>,
    target: number,
    duration: number,
  ): void {
    const start = signalRef();
    const startTime = performance.now();

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);

      signalRef.set(current);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /** Animate financial values */
  private animateFinancialValues(financiero: ResumenFinanciero, duration: number): void {
    const startValues = this.animatedFinancial();
    const startTime = performance.now();

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const newValues: Record<string, number> = {};
      for (const key of Object.keys(financiero) as (keyof ResumenFinanciero)[]) {
        const start = startValues[key] || 0;
        const target = financiero[key];
        newValues[key] = Math.round(start + (target - start) * easeOut);
      }

      this.animatedFinancial.set(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

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
