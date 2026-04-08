/**
 * Ventas Lote Page Component
 * Smart Component — batch sales registration for a VENTA evento.
 * Route: /eventos/:id/ventas/registrar
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormRecord,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { EventosStateService } from '../../services/eventos-state.service';
import { PersonasApiService } from '../../../personas/services/personas-api.service';
import { Producto, RegisterVentasLoteDto, VentaItemDto } from '../../../../shared/models';
import { Persona } from '../../../../shared/models';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-ventas-lote',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    CurrencyPipe,
    SelectFieldComponent,
    FormFieldComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './ventas-lote.component.html',
  styleUrl: './ventas-lote.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentasLoteComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly state = inject(EventosStateService);
  private readonly personasApi = inject(PersonasApiService);
  private readonly fb = inject(FormBuilder);

  private eventoId = '';

  readonly loading = this.state.loading;

  readonly productos = computed((): Producto[] =>
    this.eventoId ? (this.state.productos()[this.eventoId] ?? []) : [],
  );

  readonly personas = signal<Persona[]>([]);
  readonly submitting = signal(false);

  readonly form: FormGroup = this.fb.group({
    vendedorId: ['', Validators.required],
    cantidades: this.fb.record<number>({}),
  });

  get cantidadesRecord(): FormRecord {
    return this.form.get('cantidades') as FormRecord;
  }

  // Option helpers for SelectField
  readonly getPersonaId = (p: Persona): string => p.id;
  readonly getPersonaLabel = (p: Persona): string => p.nombre;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventoId = id;
    this.state.loadById(id);
    this.state.loadProductos(id);

    this.personasApi.getAll().subscribe((ps) => {
      this.personas.set(ps);
    });
  }

  buildCantidadControls(productos: Producto[]): void {
    productos.forEach((p) => {
      if (!this.cantidadesRecord.contains(p.id)) {
        this.cantidadesRecord.addControl(p.id, new FormControl<number>(0, { nonNullable: true }));
      }
    });
  }

  getCantidad(productoId: string): number {
    return (this.cantidadesRecord.get(productoId)?.value as number) ?? 0;
  }

  setCantidad(productoId: string, value: number): void {
    this.cantidadesRecord.get(productoId)?.setValue(value);
  }

  getSubtotal(producto: Producto): number {
    return producto.precioVenta * this.getCantidad(producto.id);
  }

  get totalGeneral(): number {
    return this.productos().reduce((sum, p) => sum + this.getSubtotal(p), 0);
  }

  onSubmit(): void {
    if (this.form.get('vendedorId')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const items: VentaItemDto[] = this.productos()
      .map((p) => ({ productoId: p.id, cantidad: this.getCantidad(p.id) }))
      .filter((item) => item.cantidad > 0);

    if (items.length === 0) return;

    const dto: RegisterVentasLoteDto = {
      vendedorId: this.form.get('vendedorId')?.value as string,
      items,
    };

    this.submitting.set(true);
    this.state.registrarVentasLote(this.eventoId, dto).subscribe({
      next: () => this.router.navigate(['/eventos', this.eventoId]),
      error: () => this.submitting.set(false),
      complete: () => this.submitting.set(false),
    });
  }

  onBack(): void {
    this.router.navigate(['/eventos', this.eventoId]);
  }
}
