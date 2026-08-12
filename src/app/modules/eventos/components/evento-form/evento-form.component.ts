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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { EventosStateService } from '../../services/eventos-state.service';
import { EventosFormBuilder } from '../../services/eventos-form.builder';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import {
  TipoEvento,
  DestinoGanancia,
  DESTINO_GANANCIA_LABELS,
  TIPO_EVENTO_LABELS,
  ModalidadVenta,
  MODALIDAD_VENTA_LABELS,
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
  private readonly confirmDialog = inject(ConfirmDialogService);

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

  readonly modalidadOptions: SelectOption[] = Object.values(ModalidadVenta).map((m) => ({
    value: m,
    label: MODALIDAD_VENTA_LABELS[m],
  }));

  readonly modalidadVenta = ModalidadVenta;

  /**
   * Espejo en señal del control `modalidadVenta`, alimentado por valueChanges.
   *
   * Los computed no pueden leer `form.get(...).value` directamente: sin
   * dependencias de señal se evalúan una sola vez y quedan congelados.
   */
  private readonly modalidadActual = signal<ModalidadVenta>(ModalidadVenta.UNICA);

  readonly esMixta = computed(() => this.modalidadActual() === ModalidadVenta.MIXTA);

  /**
   * Con modalidad mixta el destino del evento pasa a ser sólo un default que
   * nadie usa: cada venta declara el suyo. Ocultamos el selector para no
   * sugerir que esa elección decide algo.
   */
  readonly mostrarDestinoEvento = computed(() => !this.esMixta());

  readonly modalidadLabel = computed(() => MODALIDAD_VENTA_LABELS[this.modalidadActual()]);

  /**
   * La conversión ya se eligió pero todavía no se guardó. Sirve para avisar
   * que el cambio recién impacta al enviar el formulario.
   */
  readonly conversionPendiente = computed(
    () => this.esMixta() && this.state.selected()?.modalidadVenta !== ModalidadVenta.MIXTA,
  );

  readonly destinoGananciaLabel = computed(() => {
    const evento = this.state.selected();
    if (!evento?.destinoGanancia) return null;
    return DESTINO_GANANCIA_LABELS[evento.destinoGanancia as DestinoGanancia] ?? null;
  });

  private formPopulated = false;

  constructor() {
    const modalidadControl = this.form.get('modalidadVenta');
    // valueChanges no emite el valor inicial del control: hay que sembrarlo.
    this.modalidadActual.set((modalidadControl?.value as ModalidadVenta) ?? ModalidadVenta.UNICA);
    modalidadControl?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) =>
        this.modalidadActual.set((value as ModalidadVenta) ?? ModalidadVenta.UNICA),
      );

    effect(() => {
      const evento = this.state.selected();
      if (evento && this.isEditing() && !this.formPopulated) {
        this.form.patchValue({
          nombre: evento.nombre,
          tipo: evento.tipo,
          fecha: evento.fecha,
          descripcion: evento.descripcion ?? '',
          destinoGanancia: evento.destinoGanancia ?? null,
          modalidadVenta: evento.modalidadVenta ?? ModalidadVenta.UNICA,
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

  /**
   * Convierte el evento a modalidad mixta. Es de una sola mano — el backend
   * rechaza el camino inverso — así que se pide confirmación explícita antes
   * de tocar el formulario. El cambio se persiste recién al guardar.
   */
  onConvertirAMixta(): void {
    this.confirmDialog
      .confirm(
        'Convertir a modalidad mixta',
        'A partir de ahora cada venta elige si su ganancia va a la caja del grupo ' +
          'o a la cuenta personal del vendedor. Las ventas ya cargadas no se tocan: ' +
          'conservan el destino con el que se registraron.',
        {
          icon: 'call_split',
          confirmText: 'Convertir a mixto',
          cancelText: 'Cancelar',
        },
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.form.patchValue({ modalidadVenta: ModalidadVenta.MIXTA });
        }
      });
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
