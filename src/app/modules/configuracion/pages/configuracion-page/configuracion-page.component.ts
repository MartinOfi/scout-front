/**
 * Configuracion Page Component
 * Smart Component - Configuración del sistema y perfil del usuario
 */

import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { EmailFieldComponent } from '../../../../shared/components/form/email-field/email-field.component';
import { PasswordInputComponent } from '../../../../shared/components/form/password-input/password-input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfiguracionService } from '../../../../shared/services';
import { NotificationService } from '../../../../shared/services';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { BackupsService } from '../../services/backups.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-configuracion-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    FormFieldComponent,
    NumberFieldComponent,
    EmailFieldComponent,
    PasswordInputComponent,
    ButtonComponent,
  ],
  templateUrl: './configuracion-page.component.html',
  styleUrl: './configuracion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(ConfiguracionService);
  private readonly notificationService = inject(NotificationService);
  private readonly backupsService = inject(BackupsService);
  readonly authState = inject(AuthStateService);

  // ── Inscripciones ────────────────────────────────────────────
  readonly montoScoutArgentinaCtrl = new FormControl<number>(0, {
    nonNullable: true,
    validators: [Validators.min(0)],
  });

  readonly montoGrupoCtrl = new FormControl<number>(0, {
    nonNullable: true,
    validators: [Validators.min(0)],
  });

  // ── Email ────────────────────────────────────────────────────
  readonly emailForm = this.fb.group({
    newEmail: ['', [Validators.required, Validators.email]],
    currentPasswordForEmail: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly savingEmail = signal(false);

  // ── Password ─────────────────────────────────────────────────
  readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  readonly savingPassword = signal(false);

  // ── Backups & Export ─────────────────────────────────────────
  readonly downloadingXlsx = signal(false);
  readonly downloadingBackup = signal(false);

  ngOnInit(): void {
    this.montoScoutArgentinaCtrl.setValue(this.configService.montoScoutArgentina());
    this.montoGrupoCtrl.setValue(this.configService.montoGrupo());

    const user = this.authState.currentUser();
    if (user) {
      this.emailForm.patchValue({ newEmail: user.email });
    }
  }

  guardarInscripciones(): void {
    if (this.montoScoutArgentinaCtrl.invalid || this.montoGrupoCtrl.invalid) {
      this.notificationService.showError('Por favor, ingrese valores válidos');
      return;
    }

    this.configService.updateConfig({
      montoScoutArgentina: this.montoScoutArgentinaCtrl.value,
      montoGrupo: this.montoGrupoCtrl.value,
    });

    this.notificationService.showSuccess('Configuración guardada exitosamente');
  }

  guardarEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const { newEmail, currentPasswordForEmail } = this.emailForm.value;
    this.savingEmail.set(true);

    this.authState
      .changeEmail({
        newEmail: newEmail!,
        currentPassword: currentPasswordForEmail!,
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Email actualizado exitosamente');
          this.emailForm.get('currentPasswordForEmail')?.reset();
          this.savingEmail.set(false);
        },
        error: (err: { error?: { message?: string } }) => {
          const msg = err?.error?.message ?? 'Error al actualizar el email';
          this.notificationService.showError(msg);
          this.savingEmail.set(false);
        },
      });
  }

  guardarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.savingPassword.set(true);

    this.authState
      .changePassword({
        currentPassword: currentPassword!,
        newPassword: newPassword!,
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Contraseña actualizada. Por favor inicia sesión nuevamente.',
          );
          this.savingPassword.set(false);
        },
        error: (err: { error?: { message?: string } }) => {
          const msg = err?.error?.message ?? 'Error al actualizar la contraseña';
          this.notificationService.showError(msg);
          this.savingPassword.set(false);
        },
      });
  }

  get passwordMismatch(): boolean {
    return (
      !!this.passwordForm.errors?.['passwordMismatch'] &&
      !!this.passwordForm.get('confirmPassword')?.touched
    );
  }

  descargarExportXlsx(): void {
    if (this.downloadingXlsx()) {
      return;
    }
    this.downloadingXlsx.set(true);
    this.backupsService.downloadXlsxExport().subscribe({
      next: () => {
        this.notificationService.showSuccess('Exportación descargada');
        this.downloadingXlsx.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err?.error?.message ?? 'Error al exportar a Excel';
        this.notificationService.showError(msg);
        this.downloadingXlsx.set(false);
      },
    });
  }

  descargarBackupSql(): void {
    if (this.downloadingBackup()) {
      return;
    }
    this.downloadingBackup.set(true);
    this.backupsService.downloadSqlBackup().subscribe({
      next: () => {
        this.notificationService.showSuccess('Backup descargado');
        this.downloadingBackup.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err?.error?.message ?? 'Error al generar el backup';
        this.notificationService.showError(msg);
        this.downloadingBackup.set(false);
      },
    });
  }
}
