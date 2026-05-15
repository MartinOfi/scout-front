/**
 * Cuentas Personales Component
 * Smart Component - max 200 líneas
 * Gestiona las cuentas personales de educadores/protagonistas
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CajasStateService } from '../../services/cajas-state.service';
import { CajaConSaldo } from '../../../../shared/models';
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, ActionEvent } from '../../../../shared/models/table.model';
import { formatMoney } from '../../../../shared/pipes/money.pipe';
import { GenericFiltersComponent } from '../../../../shared/components/filters/generic-filters/generic-filters.component';
import { FilterConfig } from '../../../../shared/components/filters/generic-filters/filter-config.interface';
import { FilterType } from '../../../../shared/components/filters/generic-filters/filter-type.enum';
import { RAMA_LABELS, RamaEnum } from '../../../../shared/enums/persona.enum';

@Component({
  selector: 'app-cuentas-personales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DataTableComponent,
    GenericFiltersComponent,
  ],
  templateUrl: './cuentas-personales.component.html',
  styleUrls: ['./cuentas-personales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuentasPersonalesComponent implements OnInit {
  private readonly cajasState = inject(CajasStateService);
  private readonly router = inject(Router);

  readonly loading = this.cajasState.loading;

  private readonly activeSearch = signal<string>('');
  private readonly activeRama = signal<string>('');

  readonly tableData = computed((): TableData[] => {
    const rows = this.cajasState.cajasPersonales().map((caja) => ({
      id: caja.id,
      nombre: this.getNombrePropietario(caja),
      rama: this.getRamaPropietario(caja),
      saldo: caja.saldoActual,
      propietarioId: caja.propietarioId,
    }));

    const search = this.activeSearch().toLowerCase();
    if (!search) return rows;
    return rows.filter((row) => row.nombre.toLowerCase().includes(search));
  });

  // Filter configuration
  readonly filterConfigs: FilterConfig[] = [
    {
      key: 'search',
      type: FilterType.TEXT,
      label: 'Buscar',
      placeholder: 'Buscar por nombre...',
    },
    {
      key: 'rama',
      type: FilterType.SELECT,
      label: 'Rama',
      placeholder: 'Todas',
      options: [
        { value: '', label: 'Todas las ramas' },
        { value: RamaEnum.MANADA, label: RAMA_LABELS[RamaEnum.MANADA] },
        { value: RamaEnum.UNIDAD, label: RAMA_LABELS[RamaEnum.UNIDAD] },
        { value: RamaEnum.CAMINANTES, label: RAMA_LABELS[RamaEnum.CAMINANTES] },
        { value: RamaEnum.ROVERS, label: RAMA_LABELS[RamaEnum.ROVERS] },
        { value: 'educadores', label: 'Educadores' },
      ],
    },
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', sortable: true },
    { key: 'rama', header: 'Rama', type: 'status', sortable: true },
    {
      key: 'saldo',
      header: 'Saldo',
      type: 'number',
      sortable: true,
      formatter: (value: unknown) => formatMoney(value as number, 2),
    },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'action',
      actions: [
        {
          key: 'movements',
          label: 'Movimientos',
          icon: 'receipt_long',
          tooltip: 'Ver movimientos',
        },
        { key: 'register', label: 'Registrar', icon: 'add', tooltip: 'Registrar movimiento' },
      ],
    },
  ];

  ngOnInit(): void {
    this.cajasState.loadCajasPersonales();
  }

  private getNombrePropietario(caja: CajaConSaldo): string {
    if (caja.propietario) {
      return caja.propietario.nombre;
    }
    return caja.nombre ?? '-';
  }

  private getRamaPropietario(caja: CajaConSaldo): string {
    return caja.propietario?.rama ?? '-';
  }

  onActionClick(event: ActionEvent): void {
    const cajaId = event.row['id'] as string;
    switch (event.action) {
      case 'movements':
        this.router.navigate(['/movimientos'], {
          queryParams: { cajaId, tipo: 'personal' },
        });
        break;
      case 'register':
        this.router.navigate(['/movimientos/nuevo'], {
          queryParams: { cajaId, tipo: 'personal' },
        });
        break;
    }
  }

  onRowClick(row: TableData): void {
    const propietarioId = row['propietarioId'] as string;
    if (propietarioId) {
      this.router.navigate(['/personas/protagonistas', propietarioId]);
    }
  }

  onFiltersChanged(filters: Record<string, unknown>): void {
    const search = typeof filters['search'] === 'string' ? filters['search'] : '';
    const rama = typeof filters['rama'] === 'string' ? filters['rama'] : '';

    this.activeSearch.set(search);

    if (rama !== this.activeRama()) {
      this.activeRama.set(rama);
      this.cajasState.loadCajasPersonales(rama || undefined);
    }
  }
}
