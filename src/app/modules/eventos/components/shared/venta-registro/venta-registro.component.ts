/**
 * Venta Registro Component (Dumb)
 * Max 100 líneas - SIN any
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Producto, Persona, CreateVentaProductoDto } from '../../../../../shared/models';
import { positiveNumberValidator } from '../../../../../shared/validators/custom-validators';
import { MedioPagoEnum, MEDIO_PAGO_LABELS } from '../../../../../shared/enums/movimiento.enum';

// Shared Form Components
import { FormFieldComponent } from '../../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../../shared/components/form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../../shared/components/form/select-field/select-field.component';
import { MoneyPipe } from '../../../../../shared/pipes';

@Component({
  selector: 'app-venta-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    NumberFieldComponent,
    SelectFieldComponent,
    MoneyPipe,
  ],
  templateUrl: './venta-registro.component.html',
  styleUrl: './venta-registro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentaRegistroComponent implements OnInit {
  @Input() productos: Producto[] = [];
  @Input() personas: Persona[] = [];

  @Output() submit = new EventEmitter<CreateVentaProductoDto>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  readonly medioPagoOptions = Object.values(MedioPagoEnum).map((v) => ({
    value: v,
    label: MEDIO_PAGO_LABELS[v],
  }));
  readonly getMedioPagoValue = (o: { value: MedioPagoEnum }): string => o.value;
  readonly getMedioPagoLabel = (o: { value: MedioPagoEnum; label: string }): string => o.label;

  ngOnInit(): void {
    this.form = this.fb.group({
      productoId: ['', [Validators.required]],
      vendedorId: ['', [Validators.required]],
      cantidad: [1, [Validators.required, positiveNumberValidator(), Validators.min(1)]],
      medioPago: [MedioPagoEnum.EFECTIVO, [Validators.required]],
    });
  }

  // Option functions for select fields
  getProductoId = (producto: Producto): string => producto.id;
  getProductoLabel = (producto: Producto): string =>
    `${producto.nombre} - $${producto.precioVenta.toFixed(2)}`;
  getPersonaId = (persona: Persona): string => persona.id;
  getPersonaLabel = (persona: Persona): string => persona.nombre;

  get productoSeleccionado(): Producto | undefined {
    const id = this.form.get('productoId')?.value;
    return this.productos.find((p) => p.id === id);
  }

  get totalVenta(): number {
    const producto = this.productoSeleccionado;
    const cantidad = this.form.get('cantidad')?.value || 0;
    return producto ? producto.precioVenta * cantidad : 0;
  }

  /**
   * Ganancia estimada de la venta. Es null cuando el producto todavía no tiene
   * costo cargado: en ese caso no se puede calcular la ganancia (sería el 100%
   * del precio de venta, un número engañoso).
   */
  get ganancia(): number | null {
    const producto = this.productoSeleccionado;
    if (!producto || producto.precioCosto === null) return null;
    const cantidad = this.form.get('cantidad')?.value || 0;
    return (producto.precioVenta - producto.precioCosto) * cantidad;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateVentaProductoDto = {
      productoId: this.form.value.productoId as string,
      vendedorId: this.form.value.vendedorId as string,
      cantidad: Number(this.form.value.cantidad),
      medioPago: this.form.value.medioPago as MedioPagoEnum,
    };

    this.submit.emit(dto);
    this.form.reset({ cantidad: 1 });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
