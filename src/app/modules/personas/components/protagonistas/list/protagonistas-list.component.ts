/**
 * Protagonistas List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PersonasStateService } from '../../../services';
import { ConfirmDialogService, EmptyStateComponent, LoadingSpinnerComponent } from '../../../../../shared';
import { Protagonista } from '../../../../../shared/models';
import { Rama } from '../../../../../shared/enums';

// Dumb Components
import { ProtagonistaTableComponent } from './components/protagonista-table/protagonista-table.component';
import { ProtagonistaFiltersComponent } from './components/protagonista-filters/protagonista-filters.component';

@Component({
  selector: 'app-protagonistas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProtagonistaTableComponent,
    ProtagonistaFiltersComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './protagonistas-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistasListComponent implements OnInit {
  // Services inyectados
  readonly state: PersonasStateService = inject(PersonasStateService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  // Signals del estado
  readonly protagonistas = this.state.protagonistas;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.state.load();
  }

  onFilterChange(filter: { search: string; rama: Rama | null }): void {
    // TODO: Implementar filtrado en el state service
    console.log('Filter changed:', filter);
  }

  onCreate(): void {
    this.router.navigate(['/personas/protagonistas/crear']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/personas/protagonistas', id, 'editar']);
  }

  onDelete(id: string): void {
    this.confirmDialog.confirmDelete('protagonista').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe();
      }
    });
  }

  onSelect(id: string): void {
    this.router.navigate(['/personas/protagonistas', id]);
  }
}
