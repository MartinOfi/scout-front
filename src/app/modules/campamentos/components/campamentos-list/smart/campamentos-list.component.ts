/**
 * Campamentos List Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CampamentosStateService } from '../../../services';
import { ConfirmDialogService, LoadingSpinnerComponent } from '../../../../../shared';

// Dumb Components
import { CampamentoCardComponent } from '../components/campamento-card/campamento-card.component';

type CampStatus = 'upcoming' | 'active' | 'past';

interface CampStats {
  total: number;
  upcoming: number;
  active: number;
  past: number;
}

@Component({
  selector: 'app-campamentos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CampamentoCardComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './campamentos-list.component.html',
  styleUrl: './campamentos-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  /** Computed stats for camps by status */
  readonly stats = computed((): CampStats => {
    const camps = this.campamentos();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcoming = 0;
    let active = 0;
    let past = 0;

    for (const camp of camps) {
      const status = this.getCampStatus(camp.fechaInicio, camp.fechaFin, today);
      if (status === 'upcoming') upcoming++;
      else if (status === 'active') active++;
      else past++;
    }

    return { total: camps.length, upcoming, active, past };
  });

  private getCampStatus(fechaInicio: Date, fechaFin: Date, today: Date): CampStatus {
    const start = new Date(fechaInicio);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaFin);
    end.setHours(23, 59, 59, 999);

    if (today < start) return 'upcoming';
    if (today >= start && today <= end) return 'active';
    return 'past';
  }

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
