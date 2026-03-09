/**
 * Configuracion Page Component
 * Smart Component - Configuración del sistema
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfiguracionPageComponent {
  // TODO: Implementar configuración
}
