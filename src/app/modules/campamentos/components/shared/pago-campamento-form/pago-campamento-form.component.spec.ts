/**
 * PagoCampamentoFormComponent - Unit Tests
 * Dumb component with form - payment registration
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PagoCampamentoFormComponent } from './pago-campamento-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MedioPagoEnum } from '../../../../../shared/enums';

describe('PagoCampamentoFormComponent', () => {
  let component: PagoCampamentoFormComponent;
  let fixture: ComponentFixture<PagoCampamentoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCampamentoFormComponent, ReactiveFormsModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PagoCampamentoFormComponent);
    component = fixture.componentInstance;
    component.montoTotal = 1000;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.form.value.monto).toBe('');
      expect(component.form.value.medioPago).toBe('');
    });

    it('should have required validators', () => {
      const monto = component.form.get('monto');
      const medioPago = component.form.get('medioPago');

      expect(monto?.hasError('required')).toBe(true);
      expect(medioPago?.hasError('required')).toBe(true);
    });

    it('should have max validator on monto', () => {
      const monto = component.form.get('monto');
      monto?.setValue(2000); // Exceeds montoTotal
      expect(monto?.hasError('max')).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should calculate montoRestante correctly', () => {
      component.form.patchValue({ monto: 600 });
      expect(component.montoRestante).toBe(400);
    });

    it('should return montoTotal when no monto entered', () => {
      expect(component.montoRestante).toBe(1000);
    });

    it('should return 0 when monto equals montoTotal', () => {
      component.form.patchValue({ monto: 1000 });
      expect(component.montoRestante).toBe(0);
    });

    it('should not return negative when overpaid', () => {
      component.form.patchValue({ monto: 1200 });
      expect(component.montoRestante).toBe(0);
    });

    it('should return true for puedeUsarCuenta when saldo > 0', () => {
      component.saldoCuentaPersonal = 500;
      expect(component.puedeUsarCuenta).toBe(true);
    });

    it('should return false for puedeUsarCuenta when saldo = 0', () => {
      component.saldoCuentaPersonal = 0;
      expect(component.puedeUsarCuenta).toBe(false);
    });
  });

  describe('usarSaldoDisponible Method', () => {
    it('should set monto to saldo when saldo < montoTotal', () => {
      component.saldoCuentaPersonal = 500;
      component.usarSaldoDisponible();

      expect(component.form.get('monto')?.value).toBe(500);
    });

    it('should set monto to montoTotal when saldo > montoTotal', () => {
      component.saldoCuentaPersonal = 1500;
      component.usarSaldoDisponible();

      expect(component.form.get('monto')?.value).toBe(1000);
    });

    it('should set medioPago to EFECTIVO', () => {
      component.saldoCuentaPersonal = 500;
      component.usarSaldoDisponible();

      expect(component.form.get('medioPago')?.value).toBe(MedioPagoEnum.EFECTIVO);
    });
  });

  describe('onSubmit Method', () => {
    it('should emit submit with valid form', () => {
      vi.spyOn(component.submit, 'emit');

      component.form.patchValue({
        monto: 500,
        medioPago: 'efectivo'
      });

      component.onSubmit();

      expect(component.submit.emit).toHaveBeenCalledWith({
        monto: 500,
        medioPago: 'efectivo'
      });
    });

    it('should NOT emit when invalid', () => {
      vi.spyOn(component.submit, 'emit');
      component.onSubmit();
      expect(component.submit.emit).not.toHaveBeenCalled();
    });

    it('should mark all as touched when invalid', () => {
      component.onSubmit();
      expect(component.form.touched).toBe(true);
    });
  });

  describe('onCancel Method', () => {
    it('should emit cancel event', () => {
      vi.spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(component.cancel.emit).toHaveBeenCalled();
    });
  });
});
