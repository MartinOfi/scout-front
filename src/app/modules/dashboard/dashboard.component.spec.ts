/**
 * DashboardComponent Tests
 * Foco: computed `stats` (KPIs de la fila de cards). No ejercita ngOnInit
 * (fixture.detectChanges() no se llama) para no depender del resto del
 * flujo de carga de eventos/movimientos, ajeno a este cambio.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { CajasStateService } from '../cajas/services/cajas-state.service';
import { EventosApiService } from '../eventos/services/eventos-api.service';
import { MovimientosApiService } from '../movimientos/services/movimientos-api.service';
import { createMockCajasStateService, MockCajasStateService } from '../cajas/testing/cajas-test-utils';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let mockCajasState: MockCajasStateService;

  beforeEach(async () => {
    mockCajasState = createMockCajasStateService();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: CajasStateService, useValue: mockCajasState },
        { provide: EventosApiService, useValue: { getAll: vi.fn(() => of([])) } },
        { provide: MovimientosApiService, useValue: { getRecientes: vi.fn(() => of([])) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    component = TestBed.createComponent(DashboardComponent).componentInstance;
  });

  it('muestra una card de fondo solidario con el saldo del consolidado', () => {
    mockCajasState.saldoFondoSolidario.set(500000);

    const stats = component.stats();
    const fondo = stats.find((s) => s.title === 'Fondo Solidario');

    expect(fondo).toBeDefined();
    expect(fondo!.value).toBe(500000);
  });
});
