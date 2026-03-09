/**
 * Protagonistas Page Component
 * Page component - Contenedor de la página
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProtagonistasListComponent } from '../../components/protagonistas/list/protagonistas-list.component';

@Component({
  selector: 'app-protagonistas-page',
  standalone: true,
  imports: [CommonModule, ProtagonistasListComponent],
  templateUrl: './protagonistas-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistasPageComponent {}
