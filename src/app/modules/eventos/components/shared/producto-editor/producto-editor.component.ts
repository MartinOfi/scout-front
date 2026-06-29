/**
 * Producto Editor Component (Dumb)
 * Form for adding a new producto to an event.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { CreateProductoDto, Producto, UpdateProductoDto } from '../../../../../shared/models';
import {
  positiveNumberValidator,
  decimalValidator,
} from '../../../../../shared/validators/custom-validators';

// Shared Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { TextFieldComponent } from '../../../../../shared/components/form/text-field/text-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { FormActionsComponent } from '../../../../../shared/components/form/form-actions/form-actions.component';

@Component({
  selector: 'app-producto-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    FormFieldComponent,
    TextFieldComponent,
    NumberFieldComponent,
    ButtonComponent,
    FormActionsComponent,
  ],
  templateUrl: './producto-editor.component.html',
  styleUrl: './producto-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoEditorComponent implements OnInit {
  @Output() addProducto = new EventEmitter<CreateProductoDto>();
  @Output() saveProducto = new EventEmitter<UpdateProductoDto>();
  @Output() cancel = new EventEmitter<void>();

  /** When set, the editor switches to edit mode and prefills the form. */
  @Input() set producto(value: Producto | null) {
    this.editing = value !== null;
    if (value) {
      this.form.patchValue({
        nombre: value.nombre,
        precioCosto: value.precioCosto ?? '',
        precioVenta: value.precioVenta,
      });
    }
  }

  /**
   * Cuando los movimientos del evento ya están habilitados, los precios quedan
   * congelados (el backend los rechaza). En ese caso solo se permite editar el
   * nombre: los campos de precio se muestran deshabilitados.
   */
  @Input() preciosBloqueados = false;

  editing = false;

  readonly form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      // precioCosto es opcional: se puede cargar el producto sin costo y completarlo después.
      precioCosto: ['', [positiveNumberValidator(), decimalValidator(2)]],
      precioVenta: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
    });
  }

  ngOnInit(): void {
    if (this.editing && this.preciosBloqueados) {
      this.form.get('precioCosto')?.disable();
      this.form.get('precioVenta')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.editing) {
      this.saveProducto.emit(this.buildUpdateDto());
      return;
    }
    this.addProducto.emit(this.buildCreateDto());
    this.form.reset();
  }

  /** DTO de creación: precioVenta siempre, precioCosto solo si se cargó. */
  private buildCreateDto(): CreateProductoDto {
    const precioCostoRaw = this.form.value.precioCosto;
    return {
      nombre: this.form.value.nombre as string,
      precioVenta: Number(this.form.value.precioVenta),
      ...(precioCostoRaw !== '' && precioCostoRaw != null
        ? { precioCosto: Number(precioCostoRaw) }
        : {}),
    };
  }

  /**
   * DTO de edición. Con precios congelados solo viaja el nombre; de lo
   * contrario incluye los precios igual que en la creación.
   */
  private buildUpdateDto(): UpdateProductoDto {
    if (this.preciosBloqueados) {
      return { nombre: this.form.value.nombre as string };
    }
    return this.buildCreateDto();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
