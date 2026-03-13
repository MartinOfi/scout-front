/**
 * Tests for PagoInscripcionDialogComponent
 *
 * Covers:
 * 1. Create mode - registering new payments
 * 2. Edit mode - modifying existing payments
 * 3. Form validation
 * 4. Computed properties (montoTotalPago, montoRestante, etc.)
 * 5. Dialog actions (submit, cancel, delete)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import {
  PagoInscripcionDialogComponent,
  PagoInscripcionDialogData,
  PagoInscripcionDialogResult,
} from './pago-inscripcion-dialog.component';
import { createMockExistingPago } from '../../../testing/inscripciones-test-utils';
import { MedioPagoEnum } from '../../../../../shared/enums';

describe('PagoInscripcionDialogComponent', () => {
  let component: PagoInscripcionDialogComponent;
  let fixture: ComponentFixture<PagoInscripcionDialogComponent>;
  let mockDialogRef: { close: Mock };

  // Default create mode data
  const createModeData: PagoInscripcionDialogData = {
    inscripcionId: 'insc-123',
    montoPendiente: 10000,
    saldoCuentaPersonal: 3000,
  };

  // Edit mode data
  const editModeData: PagoInscripcionDialogData = {
    inscripcionId: 'insc-123',
    montoPendiente: 5000,
    mode: 'edit',
    existingPago: createMockExistingPago({
      movimientoId: 'mov-456',
      monto: 5000,
      medioPago: 'efectivo',
      descripcion: 'Pago inicial',
      fecha: '2026-01-15T10:00:00Z',
    }),
  };

  function createComponent(data: PagoInscripcionDialogData): void {
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PagoInscripcionDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    });

    fixture = TestBed.createComponent(PagoInscripcionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // ============================================================================
  // CREATE MODE TESTS
  // ============================================================================

  describe('Create Mode', () => {
    beforeEach(() => {
      createComponent(createModeData);
    });

    describe('Initialization', () => {
      it('should create the component', () => {
        expect(component).toBeTruthy();
      });

      it('should not be in edit mode', () => {
        expect(component.isEditMode).toBe(false);
      });

      it('should initialize form with create mode fields', () => {
        expect(component.form.get('montoPagado')).toBeTruthy();
        expect(component.form.get('montoConSaldoPersonal')).toBeTruthy();
        expect(component.form.get('medioPago')).toBeTruthy();
        expect(component.form.get('descripcion')).toBeTruthy();
      });

      it('should not have monto field (edit mode only)', () => {
        expect(component.form.get('monto')).toBeFalsy();
      });

      it('should initialize montoPagado to 0', () => {
        expect(component.form.get('montoPagado')?.value).toBe(0);
      });

      it('should initialize montoConSaldoPersonal to 0', () => {
        expect(component.form.get('montoConSaldoPersonal')?.value).toBe(0);
      });

      it('should initialize medioPago to efectivo', () => {
        expect(component.form.get('medioPago')?.value).toBe(MedioPagoEnum.EFECTIVO);
      });

      it('should initialize descripcion as empty string', () => {
        expect(component.form.get('descripcion')?.value).toBe('');
      });
    });

    describe('Computed Properties', () => {
      it('should return correct montoPendiente', () => {
        expect(component.montoPendiente).toBe(10000);
      });

      it('should return correct maxAllowedMonto (equals montoPendiente in create mode)', () => {
        expect(component.maxAllowedMonto).toBe(10000);
      });

      it('should return correct saldoCuentaPersonal', () => {
        expect(component.saldoCuentaPersonal).toBe(3000);
      });

      it('should return true for puedeUsarSaldo when saldo > 0', () => {
        expect(component.puedeUsarSaldo).toBe(true);
      });

      it('should calculate montoTotalPago from both fields', () => {
        component.form.patchValue({ montoPagado: 5000, montoConSaldoPersonal: 2000 });
        expect(component.montoTotalPago).toBe(7000);
      });

      it('should calculate montoRestante correctly', () => {
        component.form.patchValue({ montoPagado: 5000, montoConSaldoPersonal: 2000 });
        expect(component.montoRestante).toBe(3000);
      });

      it('should not return negative montoRestante', () => {
        component.form.patchValue({ montoPagado: 15000 });
        expect(component.montoRestante).toBe(0);
      });
    });

    describe('Form Validation', () => {
      it('should be invalid when both amounts are 0', () => {
        component.form.patchValue({ montoPagado: 0, montoConSaldoPersonal: 0 });
        expect(component.formInvalid).toBe(true);
      });

      it('should be valid when montoPagado > 0', () => {
        component.form.patchValue({ montoPagado: 5000, montoConSaldoPersonal: 0 });
        expect(component.formInvalid).toBe(false);
      });

      it('should be valid when montoConSaldoPersonal > 0', () => {
        component.form.patchValue({ montoPagado: 0, montoConSaldoPersonal: 2000 });
        expect(component.formInvalid).toBe(false);
      });

      it('should be valid when both amounts > 0', () => {
        component.form.patchValue({ montoPagado: 5000, montoConSaldoPersonal: 2000 });
        expect(component.formInvalid).toBe(false);
      });

      it('should be invalid when total exceeds montoPendiente', () => {
        component.form.patchValue({ montoPagado: 8000, montoConSaldoPersonal: 5000 });
        expect(component.formInvalid).toBe(true);
      });

      it('should be valid when total equals montoPendiente', () => {
        component.form.patchValue({ montoPagado: 7000, montoConSaldoPersonal: 3000 });
        expect(component.formInvalid).toBe(false);
      });
    });

    describe('usarSaldoDisponible', () => {
      it('should set montoConSaldoPersonal to saldo when saldo < pendiente', () => {
        component.usarSaldoDisponible();
        expect(component.form.get('montoConSaldoPersonal')?.value).toBe(3000);
      });

      it('should set montoPagado to 0', () => {
        component.form.patchValue({ montoPagado: 5000 });
        component.usarSaldoDisponible();
        expect(component.form.get('montoPagado')?.value).toBe(0);
      });
    });

    describe('Submit Action', () => {
      it('should not close dialog when form is invalid', () => {
        component.form.patchValue({ montoPagado: 0, montoConSaldoPersonal: 0 });
        component.onSubmit();
        expect(mockDialogRef.close).not.toHaveBeenCalled();
      });

      it('should mark all fields as touched when form is invalid', () => {
        component.onSubmit();
        expect(component.form.get('montoPagado')?.touched).toBe(true);
        expect(component.form.get('medioPago')?.touched).toBe(true);
      });

      it('should close dialog with create result when form is valid', () => {
        component.form.patchValue({
          montoPagado: 5000,
          montoConSaldoPersonal: 2000,
          medioPago: 'transferencia',
          descripcion: 'Test payment',
        });
        component.onSubmit();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
          mode: 'create',
          data: {
            montoPagado: 5000,
            montoConSaldoPersonal: 2000,
            medioPago: 'transferencia',
            descripcion: 'Test payment',
          },
        } as PagoInscripcionDialogResult);
      });

      it('should set montoConSaldoPersonal to undefined when 0', () => {
        component.form.patchValue({
          montoPagado: 5000,
          montoConSaldoPersonal: 0,
          medioPago: 'efectivo',
        });
        component.onSubmit();

        const result = mockDialogRef.close.mock.calls[0][0] as PagoInscripcionDialogResult;
        expect(result.mode).toBe('create');
        if (result.mode === 'create') {
          expect(result.data.montoConSaldoPersonal).toBeUndefined();
        }
      });

      it('should set descripcion to undefined when empty', () => {
        component.form.patchValue({
          montoPagado: 5000,
          descripcion: '',
        });
        component.onSubmit();

        const result = mockDialogRef.close.mock.calls[0][0] as PagoInscripcionDialogResult;
        expect(result.mode).toBe('create');
        if (result.mode === 'create') {
          expect(result.data.descripcion).toBeUndefined();
        }
      });
    });

    describe('Cancel Action', () => {
      it('should close dialog without result', () => {
        component.onCancel();
        expect(mockDialogRef.close).toHaveBeenCalledWith();
      });
    });

    describe('Delete Action (should not work in create mode)', () => {
      it('should not close dialog when called in create mode', () => {
        component.onDelete();
        expect(mockDialogRef.close).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // EDIT MODE TESTS
  // ============================================================================

  describe('Edit Mode', () => {
    beforeEach(() => {
      createComponent(editModeData);
    });

    describe('Initialization', () => {
      it('should be in edit mode', () => {
        expect(component.isEditMode).toBe(true);
      });

      it('should initialize form with edit mode fields', () => {
        expect(component.form.get('monto')).toBeTruthy();
        expect(component.form.get('medioPago')).toBeTruthy();
        expect(component.form.get('descripcion')).toBeTruthy();
      });

      it('should not have create mode fields', () => {
        expect(component.form.get('montoPagado')).toBeFalsy();
        expect(component.form.get('montoConSaldoPersonal')).toBeFalsy();
      });

      it('should initialize monto with existing payment amount', () => {
        expect(component.form.get('monto')?.value).toBe(5000);
      });

      it('should initialize medioPago with existing payment method', () => {
        expect(component.form.get('medioPago')?.value).toBe('efectivo');
      });

      it('should initialize descripcion with existing description', () => {
        expect(component.form.get('descripcion')?.value).toBe('Pago inicial');
      });
    });

    describe('Computed Properties', () => {
      it('should return maxAllowedMonto as pendiente + existing', () => {
        // pendiente = 5000, existing = 5000
        expect(component.maxAllowedMonto).toBe(10000);
      });

      it('should return montoTotalPago from monto field', () => {
        component.form.patchValue({ monto: 7000 });
        expect(component.montoTotalPago).toBe(7000);
      });

      it('should calculate montoRestante correctly in edit mode', () => {
        // pendiente + existing = 10000, new monto = 7000
        component.form.patchValue({ monto: 7000 });
        expect(component.montoRestante).toBe(3000);
      });

      it('should return 0 montoRestante when fully paying', () => {
        component.form.patchValue({ monto: 10000 });
        expect(component.montoRestante).toBe(0);
      });
    });

    describe('Form Validation', () => {
      it('should be invalid when monto is 0', () => {
        component.form.patchValue({ monto: 0 });
        expect(component.formInvalid).toBe(true);
      });

      it('should be invalid when monto exceeds maxAllowedMonto', () => {
        component.form.patchValue({ monto: 15000 });
        expect(component.formInvalid).toBe(true);
      });

      it('should be valid when monto is within limits', () => {
        component.form.patchValue({ monto: 8000 });
        expect(component.formInvalid).toBe(false);
      });

      it('should be valid when monto equals maxAllowedMonto', () => {
        component.form.patchValue({ monto: 10000 });
        expect(component.formInvalid).toBe(false);
      });
    });

    describe('Submit Action', () => {
      it('should close dialog with edit result when form is valid', () => {
        component.form.patchValue({
          monto: 7000,
          medioPago: 'transferencia',
          descripcion: 'Updated payment',
        });
        component.onSubmit();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
          mode: 'edit',
          movimientoId: 'mov-456',
          data: {
            monto: 7000,
            medioPago: 'transferencia',
            descripcion: 'Updated payment',
          },
        } as PagoInscripcionDialogResult);
      });

      it('should set descripcion to undefined when empty', () => {
        component.form.patchValue({
          monto: 7000,
          descripcion: '',
        });
        component.onSubmit();

        const result = mockDialogRef.close.mock.calls[0][0] as PagoInscripcionDialogResult;
        expect(result.mode).toBe('edit');
        if (result.mode === 'edit') {
          expect(result.data.descripcion).toBeUndefined();
        }
      });
    });

    describe('Delete Action', () => {
      it('should close dialog with delete result', () => {
        component.onDelete();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
          mode: 'delete',
          movimientoId: 'mov-456',
        } as PagoInscripcionDialogResult);
      });
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    describe('No saldoCuentaPersonal available', () => {
      beforeEach(() => {
        createComponent({
          inscripcionId: 'insc-123',
          montoPendiente: 10000,
          saldoCuentaPersonal: 0,
        });
      });

      it('should return 0 for saldoCuentaPersonal', () => {
        expect(component.saldoCuentaPersonal).toBe(0);
      });

      it('should return false for puedeUsarSaldo', () => {
        expect(component.puedeUsarSaldo).toBe(false);
      });
    });

    describe('No saldoCuentaPersonal property', () => {
      beforeEach(() => {
        createComponent({
          inscripcionId: 'insc-123',
          montoPendiente: 10000,
        });
      });

      it('should return 0 for saldoCuentaPersonal', () => {
        expect(component.saldoCuentaPersonal).toBe(0);
      });
    });

    describe('Edit mode without existingPago', () => {
      beforeEach(() => {
        createComponent({
          inscripcionId: 'insc-123',
          montoPendiente: 10000,
          mode: 'edit',
          // No existingPago - invalid state
        });
      });

      it('should not be in edit mode when existingPago is missing', () => {
        expect(component.isEditMode).toBe(false);
      });
    });

    describe('Null description in existing pago', () => {
      beforeEach(() => {
        createComponent({
          ...editModeData,
          existingPago: createMockExistingPago({
            descripcion: null,
          }),
        });
      });

      it('should initialize descripcion as empty string', () => {
        expect(component.form.get('descripcion')?.value).toBe('');
      });
    });

    describe('Small amounts', () => {
      beforeEach(() => {
        createComponent({
          inscripcionId: 'insc-123',
          montoPendiente: 100,
          saldoCuentaPersonal: 50,
        });
      });

      it('should handle small payment amounts', () => {
        component.form.patchValue({ montoPagado: 50, montoConSaldoPersonal: 50 });
        expect(component.montoTotalPago).toBe(100);
        expect(component.montoRestante).toBe(0);
        expect(component.formInvalid).toBe(false);
      });
    });

    describe('usarSaldoDisponible with higher saldo than pendiente', () => {
      beforeEach(() => {
        createComponent({
          inscripcionId: 'insc-123',
          montoPendiente: 2000,
          saldoCuentaPersonal: 5000,
        });
      });

      it('should use full pendiente when saldo > pendiente', () => {
        component.usarSaldoDisponible();
        expect(component.form.get('montoConSaldoPersonal')?.value).toBe(2000);
      });

      it('should not exceed montoPendiente even with higher saldo', () => {
        component.usarSaldoDisponible();
        expect(component.form.get('montoConSaldoPersonal')?.value).toBeLessThanOrEqual(2000);
      });
    });
  });

  // ============================================================================
  // MEDIO PAGO OPTIONS
  // ============================================================================

  describe('MedioPago Options', () => {
    beforeEach(() => {
      createComponent(createModeData);
    });

    it('should have efectivo and transferencia options', () => {
      expect(component.mediosPagoOptions).toHaveLength(2);
      expect(component.mediosPagoOptions[0].value).toBe('efectivo');
      expect(component.mediosPagoOptions[1].value).toBe('transferencia');
    });

    it('should have correct labels', () => {
      expect(component.mediosPagoOptions[0].label).toBe('Efectivo');
      expect(component.mediosPagoOptions[1].label).toBe('Transferencia');
    });

    it('should return correct value from getMedioPagoValue', () => {
      const option = component.mediosPagoOptions[0];
      expect(component.getMedioPagoValue(option)).toBe('efectivo');
    });

    it('should return correct label from getMedioPagoLabel', () => {
      const option = component.mediosPagoOptions[0];
      expect(component.getMedioPagoLabel(option)).toBe('Efectivo');
    });
  });
});
