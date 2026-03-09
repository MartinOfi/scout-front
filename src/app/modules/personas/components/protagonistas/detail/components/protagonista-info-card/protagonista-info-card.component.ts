/**
 * Protagonista Info Card Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Protagonista } from '../../../../../../../shared/models';

@Component({
  selector: 'app-protagonista-info-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './protagonista-info-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistaInfoCardComponent {
  readonly protagonista = input.required<Protagonista>();
  readonly edit = output<void>();
  readonly delete = output<void>();
}
