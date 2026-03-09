/**
 * Cuentas Personales Component
 * Smart Component - max 200 líneas
 * Gestiona las cuentas personales de educadores/protagonistas
 * SIN any - tipado estricto
 */

import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CajasStateService } from '../../services/cajas-state.service';
import { PersonasStateService } from '../../../personas/services/personas-state.service';
import { Persona } from '../../../../shared/models';

// Dumb Component
import { CuentaPersonalRowComponent } from './components/cuenta-personal-row/cuenta-personal-row.component';

interface CuentaPersonalView {
  persona: Persona;
  saldo: number;
}

@Component({
  selector: 'app-cuentas-personales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CuentaPersonalRowComponent
  ],
  templateUrl: './cuentas-personales.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuentasPersonalesComponent implements OnInit {
  private readonly cajasState = inject(CajasStateService);
  private readonly personasState = inject(PersonasStateService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Signals
  readonly loading = this.cajasState.loading;
  readonly personas = this.personasState.protagonistas;

  ngOnInit(): void {
    this.personasState.load();
  }

  onVerMovimientos(personaId: string): void {
    this.router.navigate(['/movimientos'], {
      queryParams: { personaId, tipo: 'personal' }
    });
  }

  onRegistrarMovimiento(personaId: string): void {
    this.router.navigate(['/movimientos/nuevo'], {
      queryParams: { personaId, tipo: 'personal' }
    });
  }

  onVerDetalle(personaId: string): void {
    this.router.navigate(['/personas/protagonistas', personaId]);
  }

  trackByPersonaId(index: number, persona: Persona): string {
    return persona.id;
  }
}
