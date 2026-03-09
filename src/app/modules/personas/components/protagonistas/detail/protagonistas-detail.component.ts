/**
 * Protagonistas Detail Component
 * Smart Component - max 150 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';

import { PersonasStateService } from '../../../services';
import { ConfirmDialogService, LoadingSpinnerComponent, EmptyStateComponent } from '../../../../../shared';
import { Protagonista } from '../../../../../shared/models';
import { ProtagonistaInfoCardComponent } from './components/protagonista-info-card/protagonista-info-card.component';

@Component({
  selector: 'app-protagonistas-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ProtagonistaInfoCardComponent
  ],
  templateUrl: './protagonistas-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtagonistasDetailComponent implements OnInit {
  private readonly state = inject(PersonasStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly loading: Signal<boolean> = this.state.loading;
  readonly error: Signal<string | null> = this.state.error;
  readonly protagonista: Signal<Protagonista | null> = computed(() => {
    const s = this.state.selected();
    return s && s.tipo === 'protagonista' ? s as Protagonista : null;
  });

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.state.select(id);
        if (this.state.protagonistas().length === 0) {
          this.state.load();
        }
      }
    });
  }

  onEdit(): void {
    const id = this.protagonista()?.id;
    if (id) {
      this.router.navigate(['/personas/protagonistas', id, 'editar']);
    }
  }

  onDelete(): void {
    const id = this.protagonista()?.id;
    if (!id) return;
    this.confirmDialog.confirmDelete('protagonista').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe({
          next: () => this.router.navigate(['/personas/protagonistas'])
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/personas/protagonistas']);
  }
}
