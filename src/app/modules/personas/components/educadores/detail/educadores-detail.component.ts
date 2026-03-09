/**
 * Educadores Detail Component
 * Smart Component - max 150 líneas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';

import { EducadoresStateService } from '../../../services';
import { ConfirmDialogService, LoadingSpinnerComponent, EmptyStateComponent } from '../../../../../shared';
import { Educador } from '../../../../../shared/models';

@Component({
  selector: 'app-educadores-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './educadores-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducadoresDetailComponent implements OnInit {
  private readonly state = inject(EducadoresStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly loading: Signal<boolean> = this.state.loading;
  readonly error: Signal<string | null> = this.state.error;
  readonly educador: Signal<Educador | null> = computed(() => this.state.selected());

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.state.select(id);
        if (this.state.educadores().length === 0) this.state.load();
      }
    });
  }

  onEdit(): void {
    const id = this.educador()?.id;
    if (id) this.router.navigate(['/personas/educadores', id, 'editar']);
  }

  onDelete(): void {
    const id = this.educador()?.id;
    if (!id) return;
    this.confirmDialog.confirmDelete('educador').subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.state.delete(id).subscribe({ next: () => this.router.navigate(['/personas/educadores']) });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/personas/educadores']);
  }
}
