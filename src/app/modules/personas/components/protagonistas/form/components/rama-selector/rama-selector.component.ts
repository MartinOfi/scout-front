/**
 * Rama Selector Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Rama, RAMAS } from '../../../../../../../shared/enums';

@Component({
  selector: 'app-rama-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './rama-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RamaSelectorComponent {
  readonly value = input.required<Rama | null>();
  readonly label = input<string>('Rama');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly change = output<Rama>();

  readonly ramas = RAMAS;
}
