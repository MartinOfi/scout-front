import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, inject, output, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import {
  EnhancedTableColumn,
  EnhancedTableConfig,
  EnhancedTableData,
  SelectAllState,
  TableAction,
} from '../../../models/enhanced-table.model';
import { StatusConfigService } from '../../../services/status-config.service';

/**
 * Componente de tabla mejorada con checkboxes y acciones
 *
 * Este componente proporciona una tabla completamente configurable que puede
 * manejar diferentes tipos de datos, ordenamiento, selección múltiple y acciones personalizadas.
 * Basado en las especificaciones del @todo.md
 *
 * @example
 * ```html
 * <app-enhanced-data-table
 *   [data]="services"
 *   [columns]="serviceColumns"
 *   [config]="tableConfig"
 *   [loading]="isLoading"
 *   [enableCheckboxes]="true"
 *   [actions]="tableActions"
 *   [selectedItems]="selectedServices"
 *   (selectionChange)="onSelectionChange($event)"
 *   (actionClick)="onActionClick($event)"
 *   (rowClick)="onRowClick($event)"
 * ></app-enhanced-data-table>
 * ```
 */
@Component({
    selector: 'app-enhanced-data-table',
    templateUrl: './enhanced-data-table.component.html',
    styleUrls: ['./enhanced-data-table.component.scss'],
    imports: [NgClass, MatIcon]
})
export class EnhancedDataTableComponent implements OnInit, OnChanges {
  private cdr = inject(ChangeDetectorRef);
  private statusConfig = inject(StatusConfigService);
  private sanitizer = inject(DomSanitizer);

  /**
   * Datos que se mostrarán en la tabla
   * Basado en @todo.md línea 37
   */
  readonly data = input<any[]>([]);

  /**
   * Configuración de las columnas de la tabla
   * Basado en @todo.md línea 38
   */
  readonly columns = input<EnhancedTableColumn[]>([]);

  /**
   * Configuración general de la tabla
   * Basado en @todo.md línea 39
   */
  readonly config = input<EnhancedTableConfig>({});

  /**
   * Estado de carga de la tabla
   * Basado en @todo.md línea 40
   */
  readonly loading = input<boolean>(false);

  /**
   * Habilita la funcionalidad de checkboxes para selección múltiple
   * Basado en @todo.md línea 41
   */
  readonly enableCheckboxes = input<boolean>(false);

  /**
   * Acciones disponibles para cada fila
   * Basado en @todo.md línea 42
   */
  @Input() actions: TableAction[] = [];

  /**
   * Array de IDs de elementos seleccionados
   * Basado en @todo.md línea 43
   */
  @Input() selectedItems: string[] = [];

  /**
   * Evento emitido cuando cambia la selección
   * Basado en @todo.md línea 49
   */
  readonly selectionChange = output<string[]>();

  /**
   * Evento emitido cuando se hace click en una acción
   * Basado en @todo.md línea 50
   */
  readonly actionClick = output<{
    action: string;
    item: any;
}>();

  /**
   * Evento emitido cuando se hace click en una fila
   * Basado en @todo.md línea 51
   */
  readonly rowClick = output<EnhancedTableData>();

  /** Datos transformados para la tabla */
  tableData: EnhancedTableData[] = [];

  /** Estado del checkbox "Seleccionar todo" */
  selectAllState: SelectAllState = 'none';

  /** Referencia a Math para usar en el template */
  Math = Math;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() { }

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    this.transformData();
    this.updateSelectAllState();
  }

  /**
   * Reacciona a cambios en los inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.transformData();
    }
    if (changes['selectedItems']) {
      this.updateSelectAllState();
    }
  }

  /**
   * Transforma los datos de entrada al formato requerido por la tabla
   */
  private transformData(): void {
    const data = this.data();
    if (!data || !this.columns()) {
      this.tableData = [];
      return;
    }

    this.tableData = data.map((item, index) => {
      const tableRow: EnhancedTableData = {
        id: item.id || index.toString(),
        selected: this.selectedItems.includes((item.id || index).toString()),
      };

      // Mapear cada columna a los datos
      this.columns().forEach((column) => {
        if (column.key !== 'select' && column.key !== 'actions') {
          tableRow[column.key] = this.getNestedValue(item, column.key);
        }
      });

      // Agregar datos originales para referencia
      (tableRow as any).originalData = item;

      return tableRow;
    });

    this.cdr.detectChanges();
  }

  /**
   * Obtiene un valor anidado de un objeto usando notación de punto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Actualiza el estado del checkbox "Seleccionar todo"
   */
  private updateSelectAllState(): void {
    if (!this.enableCheckboxes() || this.tableData.length === 0) {
      this.selectAllState = 'none';
      return;
    }

    const selectedCount = this.selectedItems.length;
    const totalCount = this.tableData.length;

    if (selectedCount === 0) {
      this.selectAllState = 'none';
    } else if (selectedCount === totalCount) {
      this.selectAllState = 'all';
    } else {
      this.selectAllState = 'partial';
    }
  }

  /**
   * Maneja el cambio de selección de un elemento individual
   */
  onSelectionChange(itemId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isSelected = target.checked;

    let newSelection: string[];
    if (isSelected) {
      newSelection = [...this.selectedItems, itemId];
    } else {
      newSelection = this.selectedItems.filter((id) => id !== itemId);
    }

    this.selectedItems = newSelection;
    this.updateSelectAllState();
    this.selectionChange.emit(newSelection);
  }

  /**
   * Maneja el cambio del checkbox "Seleccionar todo"
   */
  onSelectAllChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isSelected = target.checked;

    if (isSelected) {
      this.selectedItems = this.tableData.map(
        (row) => row.id?.toString() || ''
      );
    } else {
      this.selectedItems = [];
    }

    this.updateSelectAllState();
    this.selectionChange.emit(this.selectedItems);
  }

  /**
   * Verifica si un elemento está seleccionado
   */
  isItemSelected(itemId: string): boolean {
    return this.selectedItems.includes(itemId);
  }

  /**
   * Maneja el click en una acción
   */
  onActionClick(actionKey: string | undefined, item: unknown, event: Event): void {
    if (!actionKey) return;
    event.stopPropagation();
    // Usar originalData si está disponible, sino usar el item directamente
    const originalData = (item as any).originalData || item;
    this.actionClick.emit({ action: actionKey, item: originalData });
  }

  /**
   * Maneja el click en una fila
   */
  onRowClick(row: EnhancedTableData): void {
    this.rowClick.emit((row as any).originalData || row);
  }

  /**
   * Verifica si una acción está habilitada
   * Soporta tanto valores booleanos estáticos como funciones dinámicas
   * Compatible con el formato de data-table
   * @param action - Acción a verificar
   * @param row - Datos de la fila
   * @returns true si la acción está habilitada, false en caso contrario
   */
  isActionEnabled(action: TableAction, row: any): boolean {
    // Soporte para formato legacy (disabled)
    if (action.disabled) {
      return !action.disabled(row);
    }
    // Soporte para formato nuevo (enabled)
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
   * Compatible con el formato de data-table
   * @param action - Acción a verificar
   * @param row - Datos de la fila
   * @returns true si la acción está visible, false en caso contrario
   */
  isActionVisible(action: TableAction, row: any): boolean {
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
   * Obtiene las clases CSS para el estado de una columna de tipo status
   */
  getStatusColor(status: string): string {
    return this.statusConfig.getTailwindSoftClasses(status || '');
  }


  /**
   * Función de trackBy para optimización de rendimiento
   */
  trackByFn(index: number, item: EnhancedTableData): string | number {
    return item.id || index;
  }
}
