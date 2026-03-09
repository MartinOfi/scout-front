/**
 * Educadores Table Component
 * Dumb Component - max 80 líneas
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Educador } from '../../../../../../../shared/models';

@Component({
  selector: 'app-educadores-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './educadores-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresTableComponent {
  readonly data = input.required<Educador[]>();
  readonly select = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly displayedColumns = ['nombre', 'rama', 'cargo', 'estado', 'acciones'];
}
