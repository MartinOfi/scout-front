/**
 * Protagonista Table Component
 * Dumb Component - max 100 líneas
 * Solo presentación, sin lógica de negocio
 */

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Protagonista } from '../../../../../../../shared/models';

@Component({
  selector: 'app-protagonista-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './protagonista-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistaTableComponent {
  readonly data = input.required<Protagonista[]>();
  readonly select = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  displayedColumns: string[] = ['nombre', 'rama', 'estado', 'fueBonificado', 'acciones'];
}
