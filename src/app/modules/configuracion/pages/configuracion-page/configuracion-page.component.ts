/**
 * Configuracion Page Component
 * Smart Component - Configuración del sistema
 */

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { FormContainerComponent } from '../../../../shared/components/form/form-container/form-container.component';
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { FormActionsComponent } from '../../../../shared/components/form/form-actions/form-actions.component';
import { ConfiguracionService } from '../../../../shared/services';
import { NotificationService } from '../../../../shared/services';

@Component({
  selector: 'app-configuracion-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    FormContainerComponent,
    FormFieldComponent,
    NumberFieldComponent,
    FormActionsComponent,
  ],
  templateUrl: './configuracion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionPageComponent implements OnInit {
  private readonly configService = inject(ConfiguracionService);
  private readonly notificationService = inject(NotificationService);

  readonly montoScoutArgentinaCtrl = new FormControl<number>(0, {
    nonNullable: true,
    validators: [Validators.min(0)],
  });

  readonly montoGrupoCtrl = new FormControl<number>(0, {
    nonNullable: true,
    validators: [Validators.min(0)],
  });

  ngOnInit(): void {
    // Load current values from service
    this.montoScoutArgentinaCtrl.setValue(this.configService.montoScoutArgentina());
    this.montoGrupoCtrl.setValue(this.configService.montoGrupo());
  }

  guardar(): void {
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
}
