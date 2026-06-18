/**
 * Evento Movimientos Tab (dumb / presentational)
 *
 * Renders the movimientos list of an evento with the 4 filters
 * (Todos / Ingresos / Egresos / Gastos), the pagado/pendiente badge and the
 * register/delete toolbar. Filtering and the view-model mapping happen here;
 * all side effects (dialogs, HTTP, state) are emitted to the parent.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Movimiento } from '../../../../../../shared/models';
import { TipoEvento, FiltroMovimientos } from '../../../../../../shared/enums';
import { filtrarMovimientos } from '../../../../../../shared/utils/movimiento-filter.util';
import {
  ButtonTabsComponent,
  TabConfig,
} from '../../../../../../shared/components/button-tabs/button-tabs.component';
import {
  MovimientoCardComponent,
  MovimientoCardVM,
} from '../../../../../../shared/components/movimiento-card/movimiento-card.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-evento-movimientos-tab',
  standalone: true,
  imports: [
    MatIconModule,
    ButtonTabsComponent,
    MovimientoCardComponent,
    ButtonComponent,
  ],
  templateUrl: './evento-movimientos-tab.component.html',
  styleUrl: './evento-movimientos-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoMovimientosTabComponent {
  @Input() set movimientos(value: Movimiento[]) {
    this.movs.set(value ?? []);
  }
  @Input() set readonly(value: boolean) {
    this.esReadonly.set(value);
  }
  @Input() set tipo(value: TipoEvento) {
    this.eventoTipo.set(value);
  }
  @Input() set deletingIds(value: ReadonlySet<string>) {
    this.deleting.set(value);
  }

  @Output() readonly registrarIngreso = new EventEmitter<void>();
  @Output() readonly registrarGasto = new EventEmitter<void>();
  @Output() readonly pagarReembolso = new EventEmitter<MovimientoCardVM>();
  @Output() readonly eliminarMovimiento = new EventEmitter<string>();

  readonly movs = signal<Movimiento[]>([]);
  readonly esReadonly = signal(false);
  readonly eventoTipo = signal<TipoEvento>(TipoEvento.VENTA);
  readonly deleting = signal<ReadonlySet<string>>(new Set());

  readonly tipoEvento = TipoEvento;

  readonly filtroMovimientos = signal<FiltroMovimientos>(FiltroMovimientos.TODOS);

  readonly filtroMovimientosTabs: TabConfig[] = [
    { key: FiltroMovimientos.TODOS, label: 'Todos' },
    { key: FiltroMovimientos.INGRESOS, label: 'Ingresos' },
    { key: FiltroMovimientos.EGRESOS, label: 'Egresos' },
    { key: FiltroMovimientos.GASTOS, label: 'Gastos' },
  ];

  /** Movimientos filtrados y mapeados al view-model de la card compartida. */
  readonly movimientosCard = computed((): MovimientoCardVM[] =>
    filtrarMovimientos(this.movs(), this.filtroMovimientos()).map(
      (m): MovimientoCardVM => ({
        id: m.id,
        tipo: m.tipo,
        descripcion: m.descripcion,
        responsableNombre: m.responsable?.nombre ?? '',
        monto: m.monto,
        medioPago: m.medioPago,
        estadoPago: m.estadoPago,
        fecha: m.fecha,
      }),
    ),
  );

  onFiltroChange(key: string): void {
    this.filtroMovimientos.set(key as FiltroMovimientos);
  }
}
