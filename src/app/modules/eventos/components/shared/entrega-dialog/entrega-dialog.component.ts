/**
 * Entrega Dialog Component
 *
 * Self-contained Material dialog for registering a product pickup.
 *
 * Two modes:
 *  - PRESELECT (opened from a vendor row): vendedor is shown as a static
 *    label, the form only asks for cantidades + notas.
 *  - PICKER (opened from a global button — not currently used by the UI but
 *    still supported): vendedor is a select populated with everyone who has
 *    ventas in this evento.
 *
 * Stock validation reuses the in-memory `stockEntregas` snapshot passed in
 * `data`. No HTTP traffic during interaction; the backend still revalidates
 * on submit.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormRecord,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  CreateEntregaDto,
  EntregaItemDto,
  EntregaResponse,
  StockEntregaResponse,
} from '../../../../../shared/models';
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { TextFieldComponent } from '../../../../../shared/components/form/text-field/text-field.component';
import { EventosStateService } from '../../../services/eventos-state.service';

export interface EntregaDialogData {
  eventoId: string;
  stockEntregas: StockEntregaResponse[];
  vendedorIdPreseleccionado?: string;
}

interface VendedorOption {
  vendedorId: string;
  vendedorNombre: string;
}

interface ProductoStockRow {
  productoId: string;
  productoNombre: string;
  cantidadDisponible: number;
}

@Component({
  selector: 'app-entrega-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
  ],
  templateUrl: './entrega-dialog.component.html',
  styleUrl: './entrega-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntregaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(EventosStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);

  readonly form: FormGroup = this.fb.group({
    vendedorId: ['', Validators.required],
    notas: ['', Validators.maxLength(500)],
    cantidades: this.fb.record<number>({}),
  });

  /**
   * Form values as a signal so the submit-enabled computed reacts to
   * keystrokes inside cantidades inputs. Without this, `computed` only
   * reruns on signal changes — FormRecord updates would be invisible to it.
   */
  readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.value as Record<string, unknown>,
  });

  readonly selectedVendedorId = signal<string>('');

  readonly isPreseleccionado = computed((): boolean => {
    return Boolean(this.data.vendedorIdPreseleccionado);
  });

  readonly vendedorPreseleccionadoNombre = computed((): string => {
    const id = this.data.vendedorIdPreseleccionado;
    if (!id) return '';
    const row = this.data.stockEntregas.find((r) => r.vendedorId === id);
    return row?.vendedorNombre ?? '';
  });

  /**
   * Unique vendedores for the picker mode (only used when no preselect).
   * Sorted alphabetically to match the entregas tab ordering.
   */
  readonly vendedoresOptions = computed((): VendedorOption[] => {
    const seen = new Map<string, VendedorOption>();
    for (const row of this.data.stockEntregas) {
      if (!seen.has(row.vendedorId)) {
        seen.set(row.vendedorId, {
          vendedorId: row.vendedorId,
          vendedorNombre: row.vendedorNombre,
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.vendedorNombre.localeCompare(b.vendedorNombre),
    );
  });

  /**
   * Products the currently-selected vendor has stock for, filtered to
   * cantidadDisponible > 0 so the operator does not accidentally try to
   * deliver something already fully entregado.
   */
  readonly productosDisponibles = computed((): ProductoStockRow[] => {
    const vendedorId = this.selectedVendedorId();
    if (!vendedorId) return [];
    return this.data.stockEntregas
      .filter((row) => row.vendedorId === vendedorId && row.cantidadDisponible > 0)
      .map((row) => ({
        productoId: row.productoId,
        productoNombre: row.productoNombre,
        cantidadDisponible: row.cantidadDisponible,
      }))
      .sort((a, b) => a.productoNombre.localeCompare(b.productoNombre));
  });

  get cantidadesRecord(): FormRecord {
    return this.form.get('cantidades') as FormRecord;
  }

  readonly getVendedorId = (v: VendedorOption): string => v.vendedorId;
  readonly getVendedorLabel = (v: VendedorOption): string => v.vendedorNombre;

  constructor(
    private readonly dialogRef: MatDialogRef<EntregaDialogComponent, EntregaResponse>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EntregaDialogData,
  ) {
    if (data.vendedorIdPreseleccionado) {
      this.form.patchValue({ vendedorId: data.vendedorIdPreseleccionado });
      this.selectedVendedorId.set(data.vendedorIdPreseleccionado);
      // patchValue does NOT emit valueChanges by default for the same value,
      // so we have to seed the cantidades record explicitly. Without this,
      // the preselect mode would render rows with no controls bound.
      this._resetCantidades();
    }

    // takeUntilDestroyed ties the subscription to the component's lifecycle.
    // Without it, a closed-during-submit dialog could see the FormControl
    // outlive the component and Angular would warn about change detection
    // on a destroyed view.
    this.form
      .get('vendedorId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        this.selectedVendedorId.set(value ?? '');
        this._resetCantidades();
      });
  }

  private _resetCantidades(): void {
    const rec = this.cantidadesRecord;
    Object.keys(rec.controls).forEach((key) => rec.removeControl(key));
    for (const prod of this.productosDisponibles()) {
      rec.addControl(prod.productoId, new FormControl<number>(0, { nonNullable: true }));
    }
  }

  getCantidad(productoId: string): number {
    return (this.cantidadesRecord.get(productoId)?.value as number) ?? 0;
  }

  isCantidadInvalid(row: ProductoStockRow): boolean {
    const cant = this.getCantidad(row.productoId);
    return cant < 0 || cant > row.cantidadDisponible;
  }

  /**
   * Depends on formValues() so it reruns on every keystroke inside the
   * cantidades inputs — that's the missing link that left the button stuck
   * disabled before.
   */
  readonly submitDisabled = computed((): boolean => {
    this.formValues(); // dependency: re-evaluate on every form change
    if (this.submitting()) return true;
    if (!this.selectedVendedorId()) return true;
    const productos = this.productosDisponibles();
    if (productos.length === 0) return true;
    let hasAtLeastOne = false;
    for (const prod of productos) {
      const cant = this.getCantidad(prod.productoId);
      if (cant < 0 || cant > prod.cantidadDisponible) return true;
      if (cant > 0) hasAtLeastOne = true;
    }
    return !hasAtLeastOne;
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const items: EntregaItemDto[] = this.productosDisponibles()
      .map((prod) => ({ productoId: prod.productoId, cantidad: this.getCantidad(prod.productoId) }))
      .filter((item) => item.cantidad > 0);

    if (items.length === 0) return;

    const notas = (this.form.get('notas')?.value as string)?.trim();
    const dto: CreateEntregaDto = {
      vendedorId: this.form.get('vendedorId')?.value as string,
      items,
      ...(notas ? { notas } : {}),
    };

    this.submitting.set(true);
    this.state.crearEntrega(this.data.eventoId, dto).subscribe({
      next: (entrega) => this.dialogRef.close(entrega),
      error: () => this.submitting.set(false),
    });
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
