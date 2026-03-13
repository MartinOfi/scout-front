/**
 * Persona Dashboard Component (Smart Container)
 * Unified dashboard for Protagonista and Educador detail view
 * Uses signal-based state management
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { PersonasStateService } from '../../services/personas-state.service';
import { ConfirmDialogService } from '../../../../shared/services';
import { PersonaType } from '../../../../shared/enums';

import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { PersonaHeaderComponent } from './components/header/persona-header.component';
import { CuentaResumenCardsComponent } from './components/summary/cuenta-resumen-cards.component';
import { DocumentacionCardComponent } from './components/summary/documentacion-card.component';
import { ObligacionesSectionComponent } from './components/activity/obligaciones-section.component';
import { MovimientosTimelineComponent } from './components/activity/movimientos-timeline.component';

@Component({
  selector: 'app-persona-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    PersonaHeaderComponent,
    CuentaResumenCardsComponent,
    DocumentacionCardComponent,
    ObligacionesSectionComponent,
    MovimientosTimelineComponent,
  ],
  templateUrl: './persona-dashboard.component.html',
  styleUrl: './persona-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonaDashboardComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly stateService = inject(PersonasStateService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  // State from service
  readonly dashboard = this.stateService.dashboard;
  readonly loading = this.stateService.dashboardLoading;
  readonly error = this.stateService.dashboardError;
  readonly isProtagonista = this.stateService.isProtagonista;
  readonly isEducador = this.stateService.isEducador;

  // Computed signals
  readonly persona = computed(() => this.dashboard()?.persona);
  readonly cuentaPersonal = computed(() => this.dashboard()?.cuentaPersonal);
  readonly documentacion = computed(() => this.dashboard()?.documentacionPersonal);
  readonly inscripciones = computed(() => this.dashboard()?.inscripciones);
  readonly cuotas = computed(() => this.dashboard()?.cuotas);
  readonly deudaTotal = computed(() => this.dashboard()?.deudaTotal);
  readonly movimientos = computed(() => this.dashboard()?.ultimosMovimientos ?? []);

  private personaId: string | null = null;

  ngOnInit(): void {
    this.personaId = this.route.snapshot.paramMap.get('id');
    if (this.personaId) {
      this.stateService.loadDashboard(this.personaId);
    }
  }

  ngOnDestroy(): void {
    this.stateService.clearDashboard();
  }

  onBack(): void {
    this.router.navigate(['/personas']);
  }

  onEdit(): void {
    if (!this.personaId) return;

    const tipo = this.persona()?.tipo;
    if (tipo === PersonaType.PROTAGONISTA) {
      this.router.navigate(['/personas/protagonistas', this.personaId, 'editar']);
    } else if (tipo === PersonaType.EDUCADOR) {
      this.router.navigate(['/personas/educadores', this.personaId, 'editar']);
    }
  }

  onDarDeBaja(): void {
    if (!this.personaId) return;

    const nombre = this.persona()?.nombre ?? 'esta persona';

    this.confirmDialog
      .confirm(
        'Dar de baja',
        `¿Estás seguro de dar de baja a ${nombre}? El saldo de su cuenta personal será transferido a la caja del grupo.`,
        {
          icon: 'person_off',
          confirmText: 'Dar de baja',
          cancelText: 'Cancelar',
          isDestructive: true,
        },
      )
      .subscribe((confirmed) => {
        if (confirmed && this.personaId) {
          this.stateService.darDeBaja(this.personaId).subscribe({
            next: () => {
              this.router.navigate(['/personas']);
            },
          });
        }
      });
  }

  onInscripcionClick(inscripcionId: string): void {
    this.router.navigate(['/inscripciones', inscripcionId]);
  }

  onCuotaClick(cuotaId: string): void {
    this.router.navigate(['/cuotas', cuotaId]);
  }

  onVerTodosMovimientos(): void {
    this.router.navigate(['/movimientos'], {
      queryParams: { persona: this.personaId },
    });
  }
}
