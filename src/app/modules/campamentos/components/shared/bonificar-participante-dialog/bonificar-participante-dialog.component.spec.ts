/**
 * BonificarParticipanteDialogComponent Tests
 * TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  BonificarParticipanteDialogComponent,
  BonificarParticipanteDialogData,
} from './bonificar-participante-dialog.component';
import { CajasStateService } from '../../../../cajas/services/cajas-state.service';
import {
  createMockCajasStateService,
  MockCajasStateService,
} from '../../../../cajas/testing/cajas-test-utils';

describe('BonificarParticipanteDialogComponent', () => {
  let component: BonificarParticipanteDialogComponent;
  let fixture: ComponentFixture<BonificarParticipanteDialogComponent>;
  let mockStateService: MockCajasStateService;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const baseData: BonificarParticipanteDialogData = {
    campamentoId: 'camp-1',
    personaId: 'persona-1',
    participanteNombre: 'Martín',
    montoAsignado: 10000,
    montoBonificadoActual: 0,
    totalPagado: 0,
  };

  function setup(data: BonificarParticipanteDialogData = baseData): void {
    mockStateService = createMockCajasStateService();
    mockStateService.saldoFondoSolidario.set(500000);
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [BonificarParticipanteDialogComponent],
      providers: [
        { provide: CajasStateService, useValue: mockStateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BonificarParticipanteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('inicializa el form con el monto bonificado actual', () => {
    setup({ ...baseData, montoBonificadoActual: 5000 });
    expect(component.form.value.monto).toBe(5000);
  });

  it('carga el saldo del fondo solidario al abrirse, sin depender de haber visitado el dashboard antes', () => {
    setup();
    expect(mockStateService.loadFondoSolidario).toHaveBeenCalledTimes(1);
  });

  it('permite confirmar cuando el fondo alcanza y no excede lo asignado', () => {
    setup();
    component.form.patchValue({ monto: 5000 });
    expect(component.puedeConfirmar).toBe(true);
  });

  it('rechaza confirmar si el monto excede lo asignado', () => {
    setup();
    component.form.patchValue({ monto: 15000 });
    expect(component.excedeAsignado).toBe(true);
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

  it('onBonificarTodo fija el monto al total asignado', () => {
    setup();
    component.onBonificarTodo();
    expect(component.form.value.monto).toBe(10000);
  });

  it('rechaza confirmar si el monto excede el saldo pendiente cuando ya hay un pago parcial', () => {
    // $10.000 asignados, $2.000 ya pagados: sólo $8.000 son bonificables.
    setup({ ...baseData, totalPagado: 2000 });
    component.form.patchValue({ monto: 8001 });
    expect(component.maxBonificable).toBe(8000);
    expect(component.excedeAsignado).toBe(true);
    expect(component.puedeConfirmar).toBe(false);
  });

  it('permite confirmar exactamente el saldo pendiente cuando ya hay un pago parcial', () => {
    setup({ ...baseData, totalPagado: 2000 });
    component.form.patchValue({ monto: 8000 });
    expect(component.excedeAsignado).toBe(false);
    expect(component.puedeConfirmar).toBe(true);
  });

  it('onBonificarTodo fija el monto al saldo pendiente, no al total asignado, cuando ya hay un pago parcial', () => {
    setup({ ...baseData, totalPagado: 2000 });
    component.onBonificarTodo();
    expect(component.form.value.monto).toBe(8000);
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
