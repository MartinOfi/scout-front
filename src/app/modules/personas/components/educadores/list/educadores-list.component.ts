/**
 * Educadores List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EducadoresStateService } from '../../../services';
import { ConfirmDialogService, EmptyStateComponent, LoadingSpinnerComponent } from '../../../../../shared';
import { Educador } from '../../../../../shared/models';
import { Rama } from '../../../../../shared/enums';
import { EducadoresTableComponent } from './components/educadores-table/educadores-table.component';
import { EducadoresFiltersComponent } from './components/educadores-filters/educadores-filters.component';

@Component({
  selector: 'app-educadores-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    EducadoresTableComponent,
    EducadoresFiltersComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './educadores-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresListComponent implements OnInit {
  readonly state = inject(EducadoresStateService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly educadores = this.state.educadores;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.state.load();
  }

  onFilterChange(filter: { search: string; rama: Rama | null }): void {
    console.log('Filter changed:', filter);
  }

  onCreate(): void {
    this.router.navigate(['/personas/educadores/crear']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/personas/educadores', id, 'editar']);
  }

  onDelete(id: string): void {
    this.confirmDialog.confirmDelete('educador').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe();
      }
    });
  }

  onSelect(id: string): void {
    this.router.navigate(['/personas/educadores', id]);
  }
}
