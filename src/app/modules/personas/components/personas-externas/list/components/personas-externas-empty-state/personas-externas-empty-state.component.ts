/**
 * Personas Externas Empty State Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-personas-externas-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './personas-externas-empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonasExternasEmptyStateComponent {
  readonly create = output<void>();
}
