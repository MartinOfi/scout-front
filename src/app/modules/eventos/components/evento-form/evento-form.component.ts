/**
 * Evento Form Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { EventosStateService } from '../../services/eventos-state.service';
import { CreateEventoDto, UpdateEventoDto } from '../../../../shared/models';
import { TipoEvento, DestinoGanancia, DESTINO_GANANCIA_LABELS, TIPO_EVENTO_LABELS } from '../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { TextFieldComponent } from '../../../../shared/components/form/text-field/text-field.component';
import { TextareaFieldComponent } from '../../../../shared/components/form/textarea-field/textarea-field.component';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormFieldComponent,
    TextFieldComponent,
    TextareaFieldComponent,
    SelectFieldComponent
  ],
  templateUrl: './evento-form.component.html',
  styleUrls: ['./evento-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoFormComponent implements OnInit {
  private readonly state: EventosStateService = inject(EventosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loading = this.state.loading;
  readonly tipoEvento = TipoEvento;
  readonly tipoLabels = TIPO_EVENTO_LABELS;
  readonly destinoLabels = DESTINO_GANANCIA_LABELS;
  readonly destinos: DestinoGanancia[] = Object.values(DestinoGanancia);

  // Options for select fields
  readonly tipoOptions: SelectOption[] = [
    { value: TipoEvento.GRUPO, label: TIPO_EVENTO_LABELS[TipoEvento.GRUPO] },
    { value: TipoEvento.VENTA, label: TIPO_EVENTO_LABELS[TipoEvento.VENTA] }
  ];

  readonly destinoOptions: SelectOption[] = Object.values(DestinoGanancia).map(d => ({
    value: d,
    label: DESTINO_GANANCIA_LABELS[d]
  }));

  eventoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(500)],
    tipo: [TipoEvento.GRUPO, Validators.required],
    fecha: [new Date(), Validators.required],
    destinoGanancia: [null]
  });

  isEditing = false;
  eventoId: string | null = null;

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.eventoId;

    if (this.isEditing && this.eventoId) {
      this.loadEvento(this.eventoId);
    }
  }

  private loadEvento(id: string): void {
    this.state.select(id);
  }

  onSubmit(): void {
    if (this.eventoForm.invalid) {
      return;
    }

    const formValue = this.eventoForm.value;
    const dto: CreateEventoDto = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      tipo: formValue.tipo,
      fecha: formValue.fecha.toISOString(),
      destinoGanancia: formValue.destinoGanancia
    };

    if (this.isEditing && this.eventoId) {
      const updateDto: UpdateEventoDto = dto;
      this.state.update(this.eventoId, updateDto).subscribe(() => {
        this.router.navigate(['/eventos']);
      });
    } else {
      this.state.create(dto).subscribe(() => {
        this.router.navigate(['/eventos']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/eventos']);
  }
}
