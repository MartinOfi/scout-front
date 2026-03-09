import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, output, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import {
  ActionEvent,
  DataTableConfig,
  SortEvent,
  TableAction,
  TableColumn,
  TableData,
} from '../../models/table.model';
import { StatusConfigService } from '../../services/status-config.service';
import { ServiceStatusFormatPipe } from '../../pipes/service-status-format.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

/**
 * Componente de tabla reutilizable y responsivo
 *
 * Este componente proporciona una tabla completamente configurable que puede
 * manejar diferentes tipos de datos, ordenamiento, paginación y búsqueda.
 *
 * @example
 * ```html
 * <app-data-table
 *   [data]="users"
 *   [columns]="userColumns"
 *   [config]="tableConfig"
 *   [loading]="isLoading"
 *   [pageSize]="10"
 *   [currentPage]="1"
 *   [searchTerm]="searchQuery"
 *   (rowClick)="onUserClick($event)"
 *   (columnSort)="onSort($event)"
 *   (pageChange)="onPageChange($event)"
 *   (searchChange)="onSearch($event)"
 * ></app-data-table>
 * ```
 *
 * @example
 * ```typescript
 * // Configuración de columnas
 * columns: TableColumn[] = [
 *   { key: 'name', header: 'Nombre', type: 'text', sortable: true },
 *   { key: 'avatar', header: 'Avatar', type: 'image' },
 *   { key: 'status', header: 'Estado', type: 'status' },
 *   {
 *     key: 'actions',
 *     header: 'Acciones',
 *     type: 'action',
 *     actions: [
 *       {
 *         key: 'edit',
 *         label: 'Editar',
 *         icon: 'edit',
 *         tooltip: 'Editar elemento'
 *       },
 *       {
 *         key: 'delete',
 *         label: 'Eliminar',
 *         icon: 'delete',
 *         className: 'text-red-600 hover:text-red-800',
 *         tooltip: 'Eliminar elemento'
 *       }
 *     ]
 *   }
 * ];
 *
 * // Datos de ejemplo
 * data: TableData[] = [
 *   { id: 1, name: 'Juan Pérez', avatar: 'url', status: 'Activo' }
 * ];
 * ```
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  imports: [NgClass, MatIcon, ServiceStatusFormatPipe, DateFormatPipe]
})
export class DataTableComponent implements OnInit, OnChanges {
  private statusConfig = inject(StatusConfigService);
  private sanitizer = inject(DomSanitizer);

  /**
   * Datos que se mostrarán en la tabla
   *
   * Array de objetos donde cada objeto representa una fila.
   * Las claves deben coincidir con los 'key' definidos en las columnas.
   */
  readonly data = input<TableData[]>([]);

  /**
   * Configuración de las columnas de la tabla
   *
   * Define el tipo, título y comportamiento de cada columna.
   */
  readonly columns = input<TableColumn[]>([]);

  /**
   * Configuración general de la tabla
   *
   * Opciones de apariencia y comportamiento como stripedRows, hoverable, etc.
   */
  readonly config = input<DataTableConfig>({});

  /**
   * Estado de carga de la tabla
   *
   * Cuando es true, muestra un indicador de carga y deshabilita interacciones.
   */
  readonly loading = input<boolean>(false);
  readonly enableAppointmentTimeColoring = input<boolean>(false);

  /**
   * Número de filas por página
   *
   * Controla la paginación de la tabla.
   */
  readonly pageSize = input<number>(10);

  /**
   * Página actual
   *
   * Índice de la página que se está mostrando (base 1).
   */
  @Input() currentPage: number = 1;

  /**
   * Término de búsqueda
   *
   * Filtra las filas que contengan este término en cualquier columna.
   */
  @Input() searchTerm: string = '';

  /**
   * Evento emitido cuando se hace click en una fila
   *
   * Proporciona los datos completos de la fila clickeada.
   */
  readonly rowClick = output<TableData>();

  /**
   * Evento emitido cuando se hace doble click en una fila
   *
   * Proporciona los datos completos de la fila clickeada.
   */
  //rowdoble click not always required

  readonly rowDoubleClick = output<TableData>();

  /**
   * Evento emitido cuando se ordena una columna
   *
   * Proporciona información sobre la columna y dirección del ordenamiento.
   */
  readonly columnSort = output<SortEvent>();

  /**
   * Evento emitido cuando cambia la página
   *
   * Proporciona el número de la nueva página.
   */
  readonly pageChange = output<number>();

  /**
   * Evento emitido cuando cambia el término de búsqueda
   *
   * Proporciona el nuevo término de búsqueda.
   */
  readonly searchChange = output<string>();

  /**
   * Evento emitido cuando se hace click en un botón de acción
   *
   * Proporciona información sobre la acción ejecutada y los datos de la fila.
   */
  readonly actionClick = output<ActionEvent>();

  /** Estado actual del ordenamiento */
  currentSort: SortEvent | null = null;

  /** Datos ordenados según el criterio actual */
  sortedData: TableData[] = [];

  /** Datos filtrados según el término de búsqueda */
  filteredData: TableData[] = [];

  /** Datos paginados que se muestran actualmente */
  paginatedData: TableData[] = [];

  /** Número total de páginas disponibles */
  totalPages: number = 1;

  /** Referencia a Math para usar en el template */
  Math = Math;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * Inicializa el componente
   *
   * Configura los datos iniciales y aplica el primer procesamiento.
   */
  constructor() { }

  ngOnInit(): void {
    this.updateData();
  }

  /**
   * Maneja cambios en las propiedades de entrada
   *
   * Re-procesa los datos cuando cambian las propiedades relevantes.
   *
   * @param changes - Objeto que describe los cambios en las propiedades
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['columns'] ||
      changes['searchTerm'] ||
      changes['currentPage'] ||
      changes['pageSize']
    ) {
      this.updateData();
    }
  }

  /**
   * Función de tracking para optimización de rendimiento
   *
   * Angular usa esta función para identificar elementos únicos en el *ngFor.
   *
   * @param index - Índice del elemento en el array
   * @param item - Elemento actual
   * @returns Identificador único del elemento
   */
  trackByFn(index: number, item: TableData): string | number {
    const id = item['id'];
    if (typeof id === 'string' || typeof id === 'number') {
      return id;
    }
    return index;
  }

  /**
   * Maneja el click en una fila de la tabla
   *
   * Emite el evento rowClick con los datos de la fila seleccionada.
   *
   * @param row - Datos de la fila clickeada
   */
  onRowClick(row: TableData): void {
    this.rowClick.emit(row);
  }

  /**
   * Maneja el doble click en una fila de la tabla
   *
   * Emite el evento rowDoubleClick con los datos de la fila seleccionada.
   *
   * @param row - Datos de la fila clickeada
   */
  onRowDoubleClick(row: TableData): void {
    if (this.rowDoubleClick) this.rowDoubleClick.emit(row);
  }

  /**
   * Obtener clase CSS para la celda de hora de cita basada en el tiempo restante
   * @param column Configuración de la columna
   * @param row Datos de la fila
   * @returns Clase CSS para aplicar el color correspondiente
   */
  getAppointmentTimeClass(column: TableColumn, row: TableData): string {
    // Solo aplicar estilos si está habilitado y es la columna de hora de cita
    if (
      !this.enableAppointmentTimeColoring() ||
      column.key !== 'appointmentTime'
    ) {
      return '';
    }

    const appointmentTime = row[column.key];
    if (!appointmentTime || typeof appointmentTime === 'boolean') return '';

    try {
      let appointment: Date;

      // Si es una instancia de Date, usarla directamente
      if ((appointmentTime as any) instanceof Date) {
        appointment = appointmentTime as unknown as Date;
      } else {
        // Intentar parsear diferentes formatos
        const timeStr = appointmentTime as string;

        // Si es formato DD/MM/YYYY HH:mm, convertirlo a formato ISO
        if (timeStr.includes('/') && timeStr.includes(':')) {
          const [datePart, timePart] = timeStr.split(' ');
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = timePart.split(':');

          // Crear fecha en formato ISO
          const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(
            2,
            '0'
          )}T${hours}:${minutes}:00.000Z`;
          appointment = new Date(isoString);
        } else {
          // Intentar parsear como fecha normal
          appointment = new Date(appointmentTime as string | number);
        }
      }

      // Usar la fecha de la cita directamente (ya está en zona horaria local)
      const now = new Date();
      const timeDiff = appointment.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // Si ya pasó la hora de cita, mantener rojo
      if (minutesDiff < 0) {
        return 'bg-red-100 text-red-800 font-semibold';
      }
      // Si faltan 5 minutos o menos, color rojo
      else if (minutesDiff <= 5) {
        return 'bg-red-100 text-red-800 font-semibold';
      }
      // Si faltan 10 minutos o menos, color amarillo
      else if (minutesDiff <= 10) {
        return 'bg-yellow-100 text-yellow-800 font-semibold';
      }
      // Si faltan más de 10 minutos, color normal
      else {
        return '';
      }
    } catch (error) {
      console.error('Error al calcular tiempo de cita:', error);
      return '';
    }
  }

  /**
   * Maneja el ordenamiento de una columna
   *
   * Cambia la dirección del ordenamiento y emite el evento columnSort.
   *
   * @param column - Configuración de la columna a ordenar
   */
  onColumnSort(column: TableColumn): void {
    if (!column.sortable) return;

    const direction =
      this.currentSort?.column === column.key &&
        this.currentSort.direction === 'asc'
        ? 'desc'
        : 'asc';
    this.currentSort = { column: column.key, direction };
    this.updateData();
  }

  /**
   * Maneja el cambio de página
   *
   * Actualiza la página actual y emite el evento pageChange.
   *
   * @param page - Número de la nueva página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
    this.updatePaginatedData();
  }

  /**
   * Maneja el cambio en el término de búsqueda
   *
   * Actualiza el término de búsqueda y emite el evento searchChange.
   *
   * @param term - Nuevo término de búsqueda
   */
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.searchChange.emit(term);
    this.updateData();
  }

  /**
   * Actualiza todos los datos procesados
   *
   * Ejecuta el pipeline completo: ordenamiento → filtrado → paginación.
   */
  private updateData(): void {
    this.updateSortedData();
    this.updateFilteredData();
    this.updatePaginatedData();
  }

  /**
   * Ordena los datos según el criterio actual
   *
   * Aplica el ordenamiento definido en currentSort a los datos originales.
   */
  private updateSortedData(): void {
    if (!this.currentSort) {
      this.sortedData = [...this.data()];
      return;
    }

    this.sortedData = [...this.data()].sort((a, b) => {
      const aValue = a[this.currentSort!.column] ?? '';
      const bValue = b[this.currentSort!.column] ?? '';

      if (aValue < bValue)
        return this.currentSort!.direction === 'asc' ? -1 : 1;
      if (aValue > bValue)
        return this.currentSort!.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filtra los datos según el término de búsqueda
   *
   * Busca el término en todas las columnas de cada fila.
   */
  private updateFilteredData(): void {
    if (!this.searchTerm) {
      this.filteredData = [...this.sortedData];
      return;
    }

    this.filteredData = this.sortedData.filter((row) => {
      return this.columns().some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return value
          .toString()
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      });
    });
  }

  /**
   * Aplica la paginación a los datos filtrados
   *
   * Calcula el total de páginas y extrae solo los datos de la página actual.
   */
  private updatePaginatedData(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize());

    const startIndex = (this.currentPage - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  /**
   * Obtiene las clases CSS para los estados de status
   *
   * Retorna las clases de Tailwind CSS apropiadas según el estado.
   *
   * @param status - Estado del elemento (puede venir en formato backend o ya traducido)
   * @returns String con las clases CSS para el estado
   */
  getStatusColor(status: string): string {
    // Delega en la configuración centralizada para obtener clases completas
    // Soporta estados en español o en formato enum
    const parsed = this.statusConfig.resolveServiceStatus(status);
    if (!parsed) {
      return 'text-gray-800 bg-gray-100 border-gray-200';
    }
    return this.statusConfig.getStyles(parsed, 'tailwind');
  }

  /**
   * Obtiene el porcentaje numérico de puntualidad para cálculos
   *
   * @param percentage - Porcentaje de puntualidad (puede ser string, number, etc.)
   * @returns Número entre 0 y 100
   */
  getPunctualityPercentage(percentage: unknown): number {
    if (percentage === null || percentage === undefined) {
      return 0;
    }

    // Convertir a número si es string, boolean o Date
    let numPercentage: number;
    if (typeof percentage === 'string') {
      numPercentage = parseFloat(percentage.replace('%', ''));
    } else if (typeof percentage === 'number') {
      numPercentage = percentage;
    } else {
      return 0; // Boolean o Date no son válidos
    }

    if (isNaN(numPercentage)) {
      return 0;
    }

    // Asegurar que esté entre 0 y 100
    return Math.max(0, Math.min(100, numPercentage));
  }

  /**
   * Obtiene las clases CSS para el color de la barra de progreso de puntualidad
   *
   * @param percentage - Porcentaje de puntualidad (0-100)
   * @returns String con las clases CSS para el color de la barra
   */
  getPunctualityBarColor(percentage: unknown): string {
    const numPercentage = this.getPunctualityPercentage(percentage);

    if (numPercentage === 0) {
      return 'bg-gray-300';
    }

    // Colores según el wireframe: verde (≥85%), naranja (75-84%), rojo (<75%)
    if (numPercentage >= 85) {
      return 'bg-green-500'; // Verde para alta puntualidad
    } else if (numPercentage >= 75) {
      return 'bg-yellow-500'; // Naranja para puntualidad media
    } else {
      return 'bg-red-500'; // Rojo para baja puntualidad
    }
  }

  /**
   * Calcula los números de página a mostrar
   *
   * Retorna un array con los números de página que deben mostrarse
   * en el paginador, limitando a un máximo de 5 páginas visibles.
   *
   * @returns Array con los números de página a mostrar
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Maneja el click en un botón de acción
   *
   * Emite el evento actionClick con la información de la acción y la fila.
   *
   * @param actionKey Identificador de la acción
   * @param row Datos de la fila
   * @param event Evento del click
   */
  onActionClick(actionKey: string, row: TableData, event: Event): void {
    // Prevenir la propagación del evento para evitar que se active el rowClick
    event.stopPropagation();

    this.actionClick.emit({
      action: actionKey,
      row: row,
    });
  }

  /**
   * Verifica si una columna es de tipo 'phone'
   *
   * @param column - Configuración de la columna
   * @returns true si la columna es de tipo 'phone'
   */
  isPhoneColumn(column: TableColumn): boolean {
    return column.type === 'phone';
  }

  /**
   * Maneja el click en una celda de teléfono
   *
   * Abre WhatsApp en una nueva pestaña con el número formateado.
   * Previene que el click active el evento rowClick.
   *
   * @param phone - Número telefónico a abrir en WhatsApp (puede ser cualquier tipo de TableData)
   * @param event - Evento del click
   */
  onPhoneClick(
    phone: unknown,
    event: Event
  ): void {
    // Prevenir la propagación del evento para evitar que se active el rowClick
    event.stopPropagation();

    if (!phone || typeof phone === 'boolean' || phone instanceof Date) {
      return;
    }

    const phoneString = String(phone).replace(/\D/g, '');
    if (phoneString) {
      window.open(`https://wa.me/${phoneString}`, '_blank');
    }
  }

  /**
   * Sanitiza el SVG para permitir su renderizado seguro
   * @param svgString - String del SVG a sanitizar
   * @returns SafeHtml que puede ser usado con [innerHTML]
   */
  sanitizeSvg(svgString: string | undefined): SafeHtml {
    if (!svgString) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  /**
   * Verifica si una acción está habilitada
   * Soporta tanto valores booleanos estáticos como funciones dinámicas
   * @param action - Acción a verificar
   * @param row - Datos de la fila
   * @returns true si la acción está habilitada, false en caso contrario
   */
  isActionEnabled(action: TableAction, row: TableData): boolean {
    if (action.enabled === undefined) {
      return true; // Por defecto está habilitado
    }
    if (typeof action.enabled === 'boolean') {
      return action.enabled;
    }
    if (typeof action.enabled === 'function') {
      return action.enabled(row);
    }
    return true;
  }

  /**
   * Verifica si una acción está visible
   * Soporta tanto valores booleanos estáticos como funciones dinámicas
   * @param action - Acción a verificar
   * @param row - Datos de la fila
   * @returns true si la acción está visible, false en caso contrario
   */
  isActionVisible(action: TableAction, row: TableData): boolean {
    if (action.visible === undefined) {
      return true; // Por defecto está visible
    }
    if (typeof action.visible === 'boolean') {
      return action.visible;
    }
    if (typeof action.visible === 'function') {
      return action.visible(row);
    }
    return true;
  }
}
