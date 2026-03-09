/**
 * Personas Externas Page Component
 * Page component - Contenedor de la página
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonasExternasListComponent } from '../../components/personas-externas/list/personas-externas-list.component';

@Component({
  selector: 'app-personas-externas-page',
  standalone: true,
  imports: [CommonModule, PersonasExternasListComponent],
  templateUrl: './personas-externas-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonasExternasPageComponent {}
