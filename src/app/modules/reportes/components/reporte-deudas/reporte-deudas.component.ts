import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { ReportesApiService } from '../../services/reportes-api.service';
import { PersonaDeuda, DeudaFilters } from '../../models/deuda.interface';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { formatMoney } from '../../../../shared/pipes/money.pipe';
import { RamaEnum } from '../../../../shared/enums/persona.enum';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => ({
  value: CURRENT_YEAR - i,
  label: String(CURRENT_YEAR - i),
}));

@Component({
  selector: 'app-reporte-deudas',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    GenericFiltersComponent,
    ButtonComponent,
  ],
  templateUrl: './reporte-deudas.component.html',
  styleUrl: './reporte-deudas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteDeudasComponent implements OnInit {
  private readonly api = inject(ReportesApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatMoney = formatMoney;

  // ============================================================================
  // State
  // ============================================================================

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deudas = signal<PersonaDeuda[]>([]);
  readonly filters = signal<DeudaFilters>({});

  // ============================================================================
  // Computed / Derived
  // ============================================================================

  readonly summary = computed(() => {
    const all = this.deudas();
    const totalDeuda = all.reduce((s, p) => s + p.deudaTotal, 0);
    const docsFaltantes = all.filter((p) => this.hasDocDeuda(p)).length;
    return { personas: all.length, totalDeuda, docsFaltantes };
  });

  // ============================================================================
  // Filters Configuration
  // ============================================================================

  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'rama',
      type: FilterType.CHIPS,
      label: 'Rama',
      options: [
        { value: '', label: 'Todas' },
        { value: RamaEnum.MANADA, label: 'Manada' },
        { value: RamaEnum.UNIDAD, label: 'Unidad' },
        { value: RamaEnum.CAMINANTES, label: 'Caminantes' },
        { value: RamaEnum.ROVERS, label: 'Rovers' },
      ],
    },
    {
      key: 'ano',
      type: FilterType.SELECT,
      label: 'Año',
      placeholder: 'Todos los años',
      options: [{ value: '', label: 'Todos los años' }, ...YEAR_OPTIONS.map((o) => ({ value: o.value.toString(), label: o.label }))],
    },
  ];

  // ============================================================================
  // Lifecycle
  // ============================================================================

  ngOnInit(): void {
    this.load();
  }

  // ============================================================================
  // Actions
  // ============================================================================

  onFiltersChanged(raw: Record<string, unknown>): void {
    const next: DeudaFilters = {};
    if (raw['rama'] && raw['rama'] !== '') next.rama = raw['rama'] as string;
    if (raw['ano'] && raw['ano'] !== '') next.ano = Number(raw['ano']);
    this.filters.set(next);
    this.load();
  }

  retry(): void {
    this.load();
  }

  // ============================================================================
  // Helpers (used in template)
  // ============================================================================

  hasDocDeuda(p: PersonaDeuda): boolean {
    return (
      !p.documentacionPersonal.dni ||
      !p.documentacionPersonal.partidaNacimiento ||
      !p.documentacionPersonal.dniPadres ||
      !p.documentacionPersonal.carnetObraSocial ||
      p.documentacionInscripcion.length > 0 ||
      p.campamentos.some((c) => !c.autorizacionEntregada)
    );
  }

  countDocsFaltantes(p: PersonaDeuda): number {
    const personal = [
      p.documentacionPersonal.dni,
      p.documentacionPersonal.partidaNacimiento,
      p.documentacionPersonal.dniPadres,
      p.documentacionPersonal.carnetObraSocial,
    ].filter((v) => !v).length;

    const inscCount = p.documentacionInscripcion.reduce((acc, i) => {
      return (
        acc +
        [
          i.declaracionDeSalud,
          i.autorizacionDeImagen,
          i.salidasCercanas,
          i.autorizacionIngreso,
          i.certificadoAptitudFisica,
        ].filter((v) => !v).length
      );
    }, 0);

    const campCount = p.campamentos.filter((c) => !c.autorizacionEntregada).length;

    return personal + inscCount + campCount;
  }

  // ============================================================================
  // Private
  // ============================================================================

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getDeudas(this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.deudas.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el reporte. Verifique su conexión e intente nuevamente.');
          this.loading.set(false);
        },
      });
  }
}
