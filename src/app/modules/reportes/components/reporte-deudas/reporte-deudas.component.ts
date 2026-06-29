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

interface DebtCard {
  label: string;
  name: string;
  ano: number;
  saldo: number;
}

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

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deudas = signal<PersonaDeuda[]>([]);
  readonly filters = signal<DeudaFilters>({});
  readonly selectedPersonaId = signal<string | null>(null);
  readonly selectedTipo = signal<string>('');

  readonly displayedDeudas = computed(() => {
    const tipo = this.selectedTipo();
    if (!tipo) return this.deudas();
    return this.deudas().filter((p) => this.hasTipoDeuda(p, tipo));
  });

  readonly summary = computed(() => {
    const all = this.displayedDeudas();
    const totalDeuda = all.reduce((s, p) => s + p.deudaTotal, 0);
    const docsFaltantes = all.filter((p) => this.hasDocDeuda(p)).length;
    return { personas: all.length, totalDeuda, docsFaltantes };
  });

  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'rama',
      type: FilterType.SELECT,
      label: 'Rama',
      placeholder: 'Todas las ramas',
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
      options: [
        { value: '', label: 'Todos los años' },
        ...YEAR_OPTIONS.map((o) => ({ value: o.value.toString(), label: o.label })),
      ],
    },
    {
      key: 'tipo',
      type: FilterType.SELECT,
      label: 'Tipo de deuda',
      placeholder: 'Todos los tipos',
      options: [
        { value: '', label: 'Todos' },
        { value: 'campamentos', label: 'Campamentos' },
        { value: 'inscripcionesScout', label: 'Inscripciones Scout AR' },
        { value: 'inscripcionesGrupo', label: 'Inscripciones Grupo' },
        { value: 'documentacion', label: 'Documentación' },
      ],
    },
  ];

  ngOnInit(): void {
    this.load();
  }

  onFiltersChanged(raw: Record<string, unknown>): void {
    this.selectedTipo.set((raw['tipo'] as string) ?? '');

    const next: DeudaFilters = {};
    if (raw['rama'] && raw['rama'] !== '') next.rama = raw['rama'] as string;
    if (raw['ano'] && raw['ano'] !== '') next.ano = Number(raw['ano']);

    const current = this.filters();
    if (current.rama !== next.rama || current.ano !== next.ano) {
      this.filters.set(next);
      this.load();
    }
  }

  retry(): void {
    this.load();
  }

  togglePersona(id: string): void {
    this.selectedPersonaId.update((current) => (current === id ? null : id));
  }

  debtCards(p: PersonaDeuda): DebtCard[] {
    return [
      ...p.campamentos.map((c) => ({ label: 'Camp.', name: c.nombre, ano: c.ano, saldo: c.saldo })),
      ...p.inscripcionesScout.map((i) => ({
        label: 'Scout AR',
        name: 'Inscripción',
        ano: i.ano,
        saldo: i.saldo,
      })),
      ...p.inscripcionesGrupo.map((i) => ({
        label: 'Grupo',
        name: 'Inscripción',
        ano: i.ano,
        saldo: i.saldo,
      })),
      ...p.cuotas.map((c) => ({ label: 'Cuota', name: c.nombre, ano: c.ano, saldo: c.saldo })),
    ]
      .filter((d) => d.saldo > 0)
      .sort((a, b) => a.ano - b.ano || a.label.localeCompare(b.label));
  }

  hasMissingAutorizacion(p: PersonaDeuda): boolean {
    return p.campamentos.some((c) => !c.autorizacionEntregada);
  }

  /**
   * Chips de documentación personal. Educadores no tienen (null → sin chips).
   * A los mayores de edad no se les muestra el DNI de los padres (partida, DNI
   * y obra social sí).
   */
  personalDocItems(p: PersonaDeuda): { ok: boolean; label: string }[] {
    const doc = p.documentacionPersonal;
    if (!doc) return [];

    const dniPadres = p.esMayorDeEdad ? [] : [{ ok: doc.dniPadres, label: 'DNI padres' }];

    return [
      { ok: doc.dni, label: 'DNI' },
      { ok: doc.partidaNacimiento, label: 'Partida nac.' },
      ...dniPadres,
      { ok: doc.carnetObraSocial, label: 'Obra social' },
    ];
  }

  hasDocDeuda(p: PersonaDeuda): boolean {
    return (
      this.personalDocItems(p).some((d) => !d.ok) ||
      p.documentacionInscripcion.length > 0 ||
      p.campamentos.some((c) => !c.autorizacionEntregada)
    );
  }

  countDocsFaltantes(p: PersonaDeuda): number {
    const personal = this.personalDocItems(p).filter((d) => !d.ok).length;

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

  private hasTipoDeuda(p: PersonaDeuda, tipo: string): boolean {
    switch (tipo) {
      case 'campamentos':
        return p.campamentos.some((c) => c.saldo > 0);
      case 'inscripcionesScout':
        return p.inscripcionesScout.some((i) => i.saldo > 0);
      case 'inscripcionesGrupo':
        return p.inscripcionesGrupo.some((i) => i.saldo > 0);
      case 'cuotas':
        return p.cuotas.some((c) => c.saldo > 0);
      case 'documentacion':
        return this.hasDocDeuda(p);
      default:
        return true;
    }
  }

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
