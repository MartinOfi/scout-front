/**
 * BonificarInscripcionDialogComponent Tests
 * TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  BonificarInscripcionDialogComponent,
  BonificarInscripcionDialogData,
} from './bonificar-inscripcion-dialog.component';
import { CajasStateService } from '../../../../cajas/services/cajas-state.service';
import {
  createMockCajasStateService,
  MockCajasStateService,
} from '../../../../cajas/testing/cajas-test-utils';

describe('BonificarInscripcionDialogComponent', () => {
  let component: BonificarInscripcionDialogComponent;
  let fixture: ComponentFixture<BonificarInscripcionDialogComponent>;
  let mockStateService: MockCajasStateService;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const baseData: BonificarInscripcionDialogData = {
    inscripcionId: 'insc-1',
    personaNombre: 'Juana Araujo',
    montoTotal: 10000,
    montoBonificadoActual: 0,
  };

  function setup(data: BonificarInscripcionDialogData = baseData): void {
    mockStateService = createMockCajasStateService();
    mockStateService.saldoFondoSolidario.set(500000);
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [BonificarInscripcionDialogComponent],
      providers: [
        { provide: CajasStateService, useValue: mockStateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BonificarInscripcionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('carga el saldo del fondo solidario al abrirse', () => {
    setup();
    expect(mockStateService.loadFondoSolidario).toHaveBeenCalledTimes(1);
  });

  it('inicializa el form con el monto bonificado actual', () => {
    setup({ ...baseData, montoBonificadoActual: 3000 });
    expect(component.form.value.monto).toBe(3000);
  });

  it('permite confirmar cuando el fondo alcanza y no excede el total', () => {
    setup();
    component.form.patchValue({ monto: 5000 });
    expect(component.puedeConfirmar).toBe(true);
  });

  it('rechaza confirmar si el monto excede el total de la inscripción', () => {
    setup();
    component.form.patchValue({ monto: 15000 });
    expect(component.excedeTotal).toBe(true);
    expect(component.puedeConfirmar).toBe(false);
  });

  it('rechaza confirmar si el fondo solidario no alcanza', () => {
    setup();
    mockStateService.saldoFondoSolidario.set(1000);
    component.form.patchValue({ monto: 5000 });
    expect(component.saldoInsuficiente).toBe(true);
    expect(component.puedeConfirmar).toBe(false);
  });

  it('al ajustar una bonificación existente sólo exige el delta contra el fondo', () => {
    setup({ ...baseData, montoBonificadoActual: 5000 });
    mockStateService.saldoFondoSolidario.set(1000);
    component.form.patchValue({ monto: 6000 });
    expect(component.montoAdicional).toBe(1000);
    expect(component.saldoInsuficiente).toBe(false);
    expect(component.puedeConfirmar).toBe(true);
  });

  it('onBonificarTodo fija el monto al total', () => {
    setup();
    component.onBonificarTodo();
    expect(component.form.value.monto).toBe(10000);
  });

  it('onConfirmar cierra el diálogo con el monto ingresado', () => {
    setup();
    component.form.patchValue({ monto: 7000 });
    component.onConfirmar();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ monto: 7000 });
  });

  it('onConfirmar no cierra el diálogo si no se puede confirmar', () => {
    setup();
    component.form.patchValue({ monto: 15000 });
    component.onConfirmar();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('onCancelar cierra el diálogo sin resultado', () => {
    setup();
    component.onCancelar();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});
