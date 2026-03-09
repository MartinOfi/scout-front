/**
 * Educadores Empty State Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-educadores-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './educadores-empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresEmptyStateComponent {
  readonly create = output<void>();
}
