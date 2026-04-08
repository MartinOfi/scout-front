/**
 * Evento Form Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { EventosStateService } from '../../services/eventos-state.service';
import { EventosFormBuilder } from '../../services/eventos-form.builder';
import {
  TipoEvento,
  DestinoGanancia,
  DESTINO_GANANCIA_LABELS,
  TIPO_EVENTO_LABELS,
} from '../../../../shared/enums';

// Shared Form Components
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { TextFieldComponent } from '../../../../shared/components/form/text-field/text-field.component';
import { TextareaFieldComponent } from '../../../../shared/components/form/textarea-field/textarea-field.component';
import { DateFieldComponent } from '../../../../shared/components/form/date-field/date-field.component';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormActionsComponent } from '../../../../shared/components/form/form-actions/form-actions.component';

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
    MatIconModule,
    FormFieldComponent,
    TextFieldComponent,
    TextareaFieldComponent,
    DateFieldComponent,
    SelectFieldComponent,
    ButtonComponent,
    FormActionsComponent,
  ],
  templateUrl: './evento-form.component.html',
  styleUrls: ['./evento-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoFormComponent implements OnInit {
  readonly state: EventosStateService = inject(EventosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(EventosFormBuilder);

  readonly form: FormGroup = this.formBuilder.buildCreateForm();
  readonly isEditing = signal(false);
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly loadingData = computed(() => this.state.loading() && this.isEditing());

  readonly tipoEvento = TipoEvento;

  readonly tipoOptions: SelectOption[] = [
    { value: TipoEvento.GRUPO, label: TIPO_EVENTO_LABELS[TipoEvento.GRUPO] },
    { value: TipoEvento.VENTA, label: TIPO_EVENTO_LABELS[TipoEvento.VENTA] },
  ];

  readonly destinoOptions: SelectOption[] = Object.values(DestinoGanancia).map((d) => ({
    value: d,
    label: DESTINO_GANANCIA_LABELS[d],
  }));

  private formPopulated = false;

  constructor() {
    effect(() => {
      const evento = this.state.selected();
      if (evento && this.isEditing() && !this.formPopulated) {
        this.form.patchValue({
          nombre: evento.nombre,
          tipo: evento.tipo,
          fecha: evento.fecha,
          descripcion: evento.descripcion ?? '',
          destinoGanancia: evento.destinoGanancia ?? null,
          tipoEvento: evento.tipoEvento ?? '',
        });
        this.formPopulated = true;
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.state.loadById(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditing()) {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;

      const dto = this.formBuilder.extractUpdateDto(this.form);
      this.state.update(id, dto).subscribe({
        next: () => this.router.navigate(['/eventos', id]),
      });
    } else {
      const dto = this.formBuilder.extractCreateDto(this.form);
      this.state.create(dto).subscribe({
        next: (evento) => this.router.navigate(['/eventos', evento.id]),
      });
    }
  }

  onCancel(): void {
    if (this.isEditing()) {
      const id = this.route.snapshot.paramMap.get('id');
      this.router.navigate(['/eventos', id]);
    } else {
      this.router.navigate(['/eventos']);
    }
  }
}
