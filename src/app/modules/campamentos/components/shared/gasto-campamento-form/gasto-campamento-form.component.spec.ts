/**
 * GastoCampamentoFormComponent - Unit Tests
 * Dumb component with form - expense registration
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GastoCampamentoFormComponent } from './gasto-campamento-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Persona } from '../../../../../shared/models';
import { EstadoPago, PersonaType, EstadoPersona } from '../../../../../shared/enums';

describe('GastoCampamentoFormComponent', () => {
  let component: GastoCampamentoFormComponent;
  let fixture: ComponentFixture<GastoCampamentoFormComponent>;

  const mockResponsables: Persona[] = [
    {
      id: 'resp-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      fechaIngreso: new Date('2024-01-01'),
      tipo: PersonaType.EDUCADOR,
      estado: EstadoPersona.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastoCampamentoFormComponent, ReactiveFormsModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GastoCampamentoFormComponent);
    component = fixture.componentInstance;
    component.responsables = mockResponsables;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values except estadoPago', () => {
      expect(component.form.value.monto).toBe('');
      expect(component.form.value.descripcion).toBe('');
      expect(component.form.value.responsableId).toBe('');
      expect(component.form.value.medioPago).toBe('');
      expect(component.form.value.estadoPago).toBe(EstadoPago.PAGADO);
    });

    it('should have required validators on all fields', () => {
      const monto = component.form.get('monto');
      const descripcion = component.form.get('descripcion');
      const responsableId = component.form.get('responsableId');
      const medioPago = component.form.get('medioPago');
      const estadoPago = component.form.get('estadoPago');

      expect(monto?.hasError('required')).toBe(true);
      expect(descripcion?.hasError('required')).toBe(true);
      expect(responsableId?.hasError('required')).toBe(true);
      expect(medioPago?.hasError('required')).toBe(true);
      expect(estadoPago?.hasError('required')).toBe(false); // Has default value
    });

    it('should have maxLength validator on descripcion', () => {
      const descripcion = component.form.get('descripcion');
      const longText = 'a'.repeat(501);
      descripcion?.setValue(longText);

      expect(descripcion?.hasError('maxlength')).toBe(true);
    });
  });

  describe('onSubmit Method', () => {
    it('should emit submit with valid form', () => {
      vi.spyOn(component.submit, 'emit');

      component.form.patchValue({
        monto: 500,
        descripcion: 'Compra de alimentos',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO
      });

      component.onSubmit();

      expect(component.submit.emit).toHaveBeenCalledWith({
        monto: 500,
        descripcion: 'Compra de alimentos',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO
      });
    });

    it('should NOT emit when form is invalid', () => {
      vi.spyOn(component.submit, 'emit');
      component.onSubmit();
      expect(component.submit.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      component.onSubmit();

      expect(component.form.get('monto')?.touched).toBe(true);
      expect(component.form.get('descripcion')?.touched).toBe(true);
      expect(component.form.get('responsableId')?.touched).toBe(true);
      expect(component.form.get('medioPago')?.touched).toBe(true);
    });

    it('should convert monto to number', () => {
      vi.spyOn(component.submit, 'emit');

      component.form.patchValue({
        monto: '500.50',
        descripcion: 'Test',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO
      });

      component.onSubmit();

      const emittedData = (component.submit.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(typeof emittedData.monto).toBe('number');
      expect(emittedData.monto).toBe(500.50);
    });
  });

  describe('onCancel Method', () => {
    it('should emit cancel event', () => {
      vi.spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(component.cancel.emit).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should display all form fields', () => {
      const inputs = fixture.nativeElement.querySelectorAll('input');
      const selects = fixture.nativeElement.querySelectorAll('mat-select');
      const textareas = fixture.nativeElement.querySelectorAll('textarea');

      expect(inputs.length).toBeGreaterThan(0);
      expect(selects.length).toBeGreaterThan(0);
      expect(textareas.length).toBeGreaterThan(0);
    });

    it('should display responsables in select', () => {
      const nativeElement = fixture.nativeElement;
      expect(nativeElement.textContent).toContain('Juan Pérez');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty responsables array', () => {
      component.responsables = [];
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should handle decimal monto values', () => {
      vi.spyOn(component.submit, 'emit');

      component.form.patchValue({
        monto: 123.45,
        descripcion: 'Test',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO
      });

      component.onSubmit();

      expect(component.submit.emit).toHaveBeenCalled();
    });
  });
});
