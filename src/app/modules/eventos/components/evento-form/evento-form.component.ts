/**
 * Evento Form Component
 * Smart Component - max 200 lineas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventosStateService } from '../../services/eventos-state.service';
import { CreateEventoDto, UpdateEventoDto } from '../../../../shared/models';
import { TipoEvento, DestinoGanancia, DESTINO_GANANCIA_LABELS, TIPO_EVENTO_LABELS } from '../../../../shared/enums';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './evento-form.component.html',
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
