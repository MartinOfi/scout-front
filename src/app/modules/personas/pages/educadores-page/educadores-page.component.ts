/**
 * Educadores Page Component
 * Page component - Contenedor de la página
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EducadoresListComponent } from '../../components/educadores/list/educadores-list.component';

@Component({
  selector: 'app-educadores-page',
  standalone: true,
  imports: [CommonModule, EducadoresListComponent],
  templateUrl: './educadores-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresPageComponent {}
