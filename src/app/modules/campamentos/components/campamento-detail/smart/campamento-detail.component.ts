/**
 * Campamento Detail Component
 * Smart Component - max 200 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

import { CampamentosStateService } from '../../../services';
import { LoadingSpinnerComponent, ConfirmDialogService } from '../../../../../shared';
import { Campamento } from '../../../../../shared/models';

@Component({
  selector: 'app-campamento-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
  ],
  templateUrl: './campamento-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampamentoDetailComponent implements OnInit {
  // Services
  readonly state: CampamentosStateService = inject(CampamentosStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);

  // Signals
  readonly campamento = signal<Campamento | null>(null);
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCampamento(id);
    }
  }

  loadCampamento(id: string): void {
    // TODO: Implementar getById en CampamentosStateService
    // Por ahora buscar en el array
    const found = this.state.campamentos().find(c => c.id === id);
    if (found) {
      this.campamento.set(found);
      this.state.loadPagosPorParticipante(id);
    }
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/campamentos', id, 'editar']);
    }
  }

  onDelete(): void {
    this.confirmDialog.confirmDelete('campamento').subscribe((confirmed: boolean) => {
      if (confirmed) {
        // TODO: Implementar delete
        this.router.navigate(['/campamentos']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/campamentos']);
  }

  onAddParticipante(): void {
    // TODO: Abrir dialog para agregar participante
    console.log('Add participante');
  }

  onRegistrarPago(): void {
    // TODO: Abrir dialog para registrar pago
    console.log('Registrar pago');
  }

  onRegistrarGasto(): void {
    // TODO: Abrir dialog para registrar gasto
    console.log('Registrar gasto');
  }
}
