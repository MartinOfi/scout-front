/**
 * Movimiento Detail Component (Smart)
 * Max 150 líneas - SIN any
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MovimientosStateService } from '../../../services/movimientos-state.service';
import { Movimiento } from '../../../../../shared/models';
import { MovimientoInfoCardComponent } from '../../shared/movimiento-info-card/movimiento-info-card.component';
import { ConfirmDialogService } from '../../../../../shared/services';

@Component({
  selector: 'app-movimiento-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MovimientoInfoCardComponent
  ],
  templateUrl: './movimiento-detail.component.html',
  styleUrl: './movimiento-detail.component.scss'
})
export class MovimientoDetailComponent implements OnInit {
  private readonly state = inject(MovimientosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly movimiento = signal<Movimiento | null>(null);
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovimiento(id);
    } else {
      this.router.navigate(['/movimientos']);
    }
  }

  private loadMovimiento(id: string): void {
    this.state.select(id);
    const selected = this.state.selected();

    if (selected) {
      this.movimiento.set(selected);
    } else {
      // Si no está en la lista, cargar todos y buscar
      this.state.load();
      // Esperar a que cargue y buscar
      setTimeout(() => {
        const found = this.state.selected();
        if (found) {
          this.movimiento.set(found);
        } else {
          this.router.navigate(['/movimientos']);
        }
      }, 500);
    }
  }

  onEdit(): void {
    const mov = this.movimiento();
    if (mov) {
      this.router.navigate(['/movimientos', mov.id, 'editar']);
    }
  }

  onDelete(): void {
    const mov = this.movimiento();
    if (!mov) return;

    this.confirmDialog.confirmDelete('movimiento').subscribe((confirmed: boolean) => {
      if (confirmed && mov) {
        this.state.delete(mov.id).subscribe({
          next: () => {
            this.router.navigate(['/movimientos']);
          },
          error: () => {
            // Error ya manejado por el state service
          }
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/movimientos']);
  }
}
