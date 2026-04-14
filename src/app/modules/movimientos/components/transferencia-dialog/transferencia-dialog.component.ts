import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../shared/components/form/select-field/select-field.component';
import { TextareaFieldComponent } from '../../../../shared/components/form/textarea-field/textarea-field.component';
import { DateFieldComponent } from '../../../../shared/components/form/date-field/date-field.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ReadonlyCardComponent } from '../../../../shared/components/readonly-card/readonly-card.component';

import { MovimientosApiService } from '../../services/movimientos-api.service';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { CajaConSaldo } from '../../../../shared/models';
import { CajaType } from '../../../../shared/enums';

interface CajaDestinoOption {
  value: string;
  label: string;
}

export interface TransferenciaDialogData {
  cajaGrupo: CajaConSaldo;
}

@Component({
  selector: 'app-transferencia-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormFieldComponent,
    NumberFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    DateFieldComponent,
    ButtonComponent,
    ReadonlyCardComponent,
  ],
  templateUrl: './transferencia-dialog.component.html',
  styleUrl: './transferencia-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferenciaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly movimientosApi = inject(MovimientosApiService);
  private readonly cajasApi = inject(CajasApiService);
  private readonly auth = inject(AuthStateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly cajaGrupo: CajaConSaldo;
  readonly saldoOrigen = signal(0);
  readonly saldoOrigenLabel = computed(
    () =>
      `Saldo disponible: $${this.saldoOrigen().toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  );
  readonly destinos = signal<CajaDestinoOption[]>([]);

  readonly currentUser = this.auth.currentUser;
  readonly responsableLabel = computed(() => this.currentUser()?.nombre ?? 'Usuario actual');

  readonly form: FormGroup = this.fb.group({
    cajaDestinoId: ['', [Validators.required]],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
    descripcion: [''],
  });

  constructor(
    private readonly dialogRef: MatDialogRef<TransferenciaDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public readonly data: TransferenciaDialogData,
  ) {
    this.cajaGrupo = data.cajaGrupo;
    this.saldoOrigen.set(data.cajaGrupo.saldoActual);
    this.loadOptions();
  }

  private loadOptions(): void {
    this.cajasApi.getAll().subscribe({
      next: (cajas) => {
        this.destinos.set(this.buildDestinoOptions(cajas));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las cajas');
        this.loading.set(false);
      },
    });
  }

  private buildDestinoOptions(cajas: CajaConSaldo[]): CajaDestinoOption[] {
    return cajas
      .filter((c) => c.id !== this.cajaGrupo.id && c.tipo !== CajaType.PERSONAL)
      .map((c) => ({
        value: c.id,
        label: this.labelCaja(c),
      }));
  }

  private labelCaja(caja: CajaConSaldo): string {
    if (caja.nombre) return caja.nombre;
    switch (caja.tipo) {
      case CajaType.RAMA_MANADA:
        return 'Fondo Manada';
      case CajaType.RAMA_UNIDAD:
        return 'Fondo Unidad';
      case CajaType.RAMA_CAMINANTES:
        return 'Fondo Caminantes';
      case CajaType.RAMA_ROVERS:
        return 'Fondo Rovers';
      default:
        return `Caja ${caja.id.slice(0, 8)}`;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.currentUser()?.id;
    if (!userId) {
      this.errorMessage.set('No se pudo identificar al usuario autenticado');
      return;
    }

    const value = this.form.value as {
      cajaDestinoId: string;
      monto: number;
      fecha: string;
      descripcion: string;
    };

    if (value.monto > this.saldoOrigen()) {
      this.errorMessage.set(
        `Saldo insuficiente en caja de grupo (disponible: $${this.saldoOrigen()})`,
      );
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.movimientosApi
      .crearTransferencia({
        cajaOrigenId: this.cajaGrupo.id,
        cajaDestinoId: value.cajaDestinoId,
        monto: Number(value.monto),
        responsableId: userId,
        fecha: value.fecha,
        descripcion: value.descripcion || undefined,
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.saving.set(false);
          this.errorMessage.set(
            err.error?.message ?? err.message ?? 'Error al crear la transferencia',
          );
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
