/**
 * Producto Editor Component (Dumb)
 * Form for adding a new producto to an event.
 */

import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { CreateProductoDto } from '../../../../../shared/models';
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
export class ProductoEditorComponent {
  @Output() addProducto = new EventEmitter<CreateProductoDto>();
  @Output() cancel = new EventEmitter<void>();

  readonly form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precioCosto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      precioVenta: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
    });
  }

  onAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.addProducto.emit({
      nombre: this.form.value.nombre as string,
      precioCosto: Number(this.form.value.precioCosto),
      precioVenta: Number(this.form.value.precioVenta),
    });
    this.form.reset();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
