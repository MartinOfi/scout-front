/**
 * Producto Editor Component (Dumb)
 * Max 100 líneas - SIN any
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Producto, CreateProductoDto } from '../../../../../shared/models';
import { positiveNumberValidator, decimalValidator } from '../../../../../shared/validators/custom-validators';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { TextFieldComponent } from '../../../../../shared/components/form/text-field/text-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';

@Component({
  selector: 'app-producto-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FormFieldComponent,
    TextFieldComponent,
    NumberFieldComponent
  ],
  templateUrl: './producto-editor.component.html',
  styleUrl: './producto-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoEditorComponent {
  @Input() productos: Producto[] = [];

  @Output() addProducto = new EventEmitter<CreateProductoDto>();
  @Output() removeProducto = new EventEmitter<string>();
  @Output() updateProducto = new EventEmitter<{ id: string; dto: Partial<Producto> }>();

  readonly displayedColumns = ['nombre', 'precioCosto', 'precioVenta', 'margen', 'actions'];

  readonly form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precioCosto: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]],
      precioVenta: ['', [Validators.required, positiveNumberValidator(), decimalValidator(2)]]
    });
  }

  calcularMargen(producto: Producto): number {
    return producto.precioVenta - producto.precioCosto;
  }

  calcularPorcentajeMargen(producto: Producto): number {
    if (producto.precioCosto === 0) return 0;
    return ((producto.precioVenta - producto.precioCosto) / producto.precioCosto) * 100;
  }

  onAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateProductoDto = {
      nombre: this.form.value.nombre as string,
      precioCosto: Number(this.form.value.precioCosto),
      precioVenta: Number(this.form.value.precioVenta)
    };

    this.addProducto.emit(dto);
    this.form.reset();
  }

  onRemove(id: string): void {
    this.removeProducto.emit(id);
  }
}
