/**
 * PersonaSelectorDialogComponent Tests
 * Focused on the optional "bonificar" field (showBonificarField/montoBonificableFn)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  PersonaSelectorDialogComponent,
  PersonaSelectorDialogData,
} from './persona-selector-dialog.component';
import { PersonasApiService } from '../../../modules/personas/services/personas-api.service';
import { Protagonista, Educador } from '../../models';
import { PersonaType, EstadoPersona, RamaEnum, CargoEducador } from '../../enums';

describe('PersonaSelectorDialogComponent - bonificar field', () => {
  let component: PersonaSelectorDialogComponent;
  let fixture: ComponentFixture<PersonaSelectorDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const protagonista: Protagonista = {
    id: 'prota-1',
    tipo: PersonaType.PROTAGONISTA,
    nombre: 'Ana Test',
    estado: EstadoPersona.ACTIVO,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    deletedAt: null,
    rama: RamaEnum.MANADA,
    partidaNacimiento: false,
    dni: false,
    dniPadres: false,
    carnetObraSocial: false,
  };

  const educadorExento: Educador = {
    id: 'edu-1',
    tipo: PersonaType.EDUCADOR,
    nombre: 'Beto Educador',
    estado: EstadoPersona.ACTIVO,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    deletedAt: null,
    rama: RamaEnum.UNIDAD,
    cargo: CargoEducador.EDUCADOR,
  };

  function setup(data: Partial<PersonaSelectorDialogData> = {}): void {
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PersonaSelectorDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Agregar', ...data },
        },
        {
          provide: PersonasApiService,
          useValue: { getAll: vi.fn().mockReturnValue(of([protagonista, educadorExento])) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonaSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('no muestra el campo de bonificar sin showBonificarField', () => {
    setup();
    component.form.patchValue({ personaId: 'prota-1' });
    expect(component.mostrarCampoBonificar).toBe(false);
  });

  it('no muestra el campo de bonificar si la persona no admite bonificación (monto máximo 0)', () => {
    setup({ showBonificarField: true, montoBonificableFn: () => 0 });
    component.form.patchValue({ personaId: 'edu-1' });
    expect(component.mostrarCampoBonificar).toBe(false);
  });

  it('muestra el campo de bonificar cuando la persona admite un monto > 0', () => {
    setup({ showBonificarField: true, montoBonificableFn: () => 50000 });
    component.form.patchValue({ personaId: 'prota-1' });
    expect(component.montoMaximoBonificable).toBe(50000);
    expect(component.mostrarCampoBonificar).toBe(true);
  });

  it('rechaza confirmar si el monto excede el máximo bonificable', () => {
    setup({ showBonificarField: true, montoBonificableFn: () => 50000 });
    component.form.patchValue({ personaId: 'prota-1', monto: 60000 });
    expect(component.bonificarExcedeMaximo).toBe(true);

    component.onConfirm();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('incluye montoBonificado en el resultado cuando es > 0', () => {
    setup({ showBonificarField: true, montoBonificableFn: () => 50000 });
    component.form.patchValue({ personaId: 'prota-1', monto: 10000 });

    component.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ montoBonificado: 10000 }),
    );
  });

  it('no incluye montoBonificado en el resultado cuando es 0', () => {
    setup({ showBonificarField: true, montoBonificableFn: () => 50000 });
    component.form.patchValue({ personaId: 'prota-1', monto: 0 });

    component.onConfirm();

    const result = mockDialogRef.close.mock.calls[0][0];
    expect(result.montoBonificado).toBeUndefined();
  });
});

describe('PersonaSelectorDialogComponent - pago field', () => {
  let component: PersonaSelectorDialogComponent;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const protagonista: Protagonista = {
    id: 'prota-1',
    tipo: PersonaType.PROTAGONISTA,
    nombre: 'Ana Test',
    estado: EstadoPersona.ACTIVO,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    deletedAt: null,
    rama: RamaEnum.MANADA,
    partidaNacimiento: false,
    dni: false,
    dniPadres: false,
    carnetObraSocial: false,
  };

  function setup(data: Partial<PersonaSelectorDialogData> = {}): void {
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PersonaSelectorDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Agregar', ...data } },
        {
          provide: PersonasApiService,
          useValue: { getAll: vi.fn().mockReturnValue(of([protagonista])) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PersonaSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const conPago: Partial<PersonaSelectorDialogData> = {
    showPagoField: true,
    showBonificarField: true,
    montoBonificableFn: () => 50000,
  };

  it('no muestra el campo de pago sin showPagoField', () => {
    setup({ showBonificarField: true, montoBonificableFn: () => 50000 });
    component.form.patchValue({ personaId: 'prota-1' });
    expect(component.mostrarCampoPago).toBe(false);
  });

  it('muestra el campo de pago cuando hay persona seleccionada con costo > 0', () => {
    setup(conPago);
    component.form.patchValue({ personaId: 'prota-1' });
    expect(component.mostrarCampoPago).toBe(true);
  });

  it('el máximo a pagar descuenta la bonificación', () => {
    setup(conPago);
    component.form.patchValue({ personaId: 'prota-1', monto: 20000 });
    expect(component.montoMaximoPago).toBe(30000);
  });

  it('rechaza confirmar si el pago excede el máximo', () => {
    setup(conPago);
    component.form.patchValue({ personaId: 'prota-1', monto: 20000, montoPago: 40000 });
    expect(component.pagoExcedeMaximo).toBe(true);

    component.onConfirm();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('incluye el pago en el resultado cuando el monto es > 0', () => {
    setup(conPago);
    component.form.patchValue({
      personaId: 'prota-1',
      montoPago: 15000,
      medioPago: 'transferencia',
    });

    component.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ pago: { monto: 15000, medioPago: 'transferencia' } }),
    );
  });

  it('no incluye pago en el resultado cuando el monto es 0 (es opcional)', () => {
    setup(conPago);
    component.form.patchValue({ personaId: 'prota-1', montoPago: 0 });

    component.onConfirm();

    const result = mockDialogRef.close.mock.calls[0][0];
    expect(result.pago).toBeUndefined();
  });
});
