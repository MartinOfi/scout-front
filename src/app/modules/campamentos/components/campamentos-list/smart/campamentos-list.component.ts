/**
 * Campamentos List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CampamentosStateService } from '../../../services';
import { ConfirmDialogService, EmptyStateComponent, LoadingSpinnerComponent } from '../../../../../shared';

// Dumb Components
import { CampamentoCardComponent } from '../components/campamento-card/campamento-card.component';

@Component({
  selector: 'app-campamentos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CampamentoCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './campamentos-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampamentosListComponent implements OnInit {
  // Services
  readonly state: CampamentosStateService = inject(CampamentosStateService);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  // Signals
  readonly campamentos = this.state.campamentos;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.state.load();
  }

  onCreate(): void {
    this.router.navigate(['/campamentos/crear']);
  }

  onSelect(id: string): void {
    this.router.navigate(['/campamentos', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/campamentos', id, 'editar']);
  }

  onDelete(id: string): void {
    this.confirmDialog.confirmDelete('campamento').subscribe((confirmed: boolean) => {
      if (confirmed) {
        // TODO: Implementar delete en CampamentosStateService
        console.log('Delete campamento:', id);
      }
    });
  }
}
