/**
 * Personas Externas List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PersonasExternasStateService } from '../../../services';
import { ConfirmDialogService, EmptyStateComponent, LoadingSpinnerComponent } from '../../../../../shared';
import { PersonaExterna } from '../../../../../shared/models';
import { PersonasExternasTableComponent } from './components/personas-externas-table/personas-externas-table.component';
import { PersonasExternasFiltersComponent } from './components/personas-externas-filters/personas-externas-filters.component';

@Component({
  selector: 'app-personas-externas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PersonasExternasTableComponent,
    PersonasExternasFiltersComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './personas-externas-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonasExternasListComponent implements OnInit {
  readonly state = inject(PersonasExternasStateService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly personasExternas = this.state.personasExternas;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.state.load();
  }

  onFilterChange(filter: { search: string }): void {
    console.log('Filter changed:', filter);
  }

  onCreate(): void {
    this.router.navigate(['/personas/personas-externas/crear']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/personas/personas-externas', id, 'editar']);
  }

  onDelete(id: string): void {
    this.confirmDialog.confirmDelete('persona externa').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe();
      }
    });
  }

  onSelect(id: string): void {
    this.router.navigate(['/personas/personas-externas', id]);
  }
}
