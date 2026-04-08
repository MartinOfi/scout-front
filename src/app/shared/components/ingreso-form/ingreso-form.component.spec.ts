/**
 * IngresoFormComponent - Unit Tests (Jasmine/Karma)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { IngresoFormComponent, IngresoFormValue } from './ingreso-form.component';
import { Persona } from '../../models';
import { PersonaType, EstadoPersona } from '../../enums';

const mockPersonas: Persona[] = [
  {
    id: 'p1',
    nombre: 'Ana',
    apellido: 'García',
    dni: '12345678',
    fechaIngreso: new Date('2024-01-01'),
    tipo: PersonaType.EDUCADOR,
    estado: EstadoPersona.ACTIVO,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('IngresoFormComponent', () => {
  let component: IngresoFormComponent;
  let fixture: ComponentFixture<IngresoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoFormComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoFormComponent);
    component = fixture.componentInstance;
    component.responsables = mockPersonas;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty values', () => {
      expect(component.form.value.monto).toBe('');
      expect(component.form.value.descripcion).toBe('');
      expect(component.form.value.responsableId).toBe('');
      expect(component.form.value.medioPago).toBe('');
    });

    it('should require monto, descripcion, responsableId, medioPago', () => {
      expect(component.form.get('monto')?.hasError('required')).toBeTrue();
      expect(component.form.get('descripcion')?.hasError('required')).toBeTrue();
      expect(component.form.get('responsableId')?.hasError('required')).toBeTrue();
      expect(component.form.get('medioPago')?.hasError('required')).toBeTrue();
    });

    it('should validate maxLength(500) on descripcion', () => {
      component.form.get('descripcion')?.setValue('a'.repeat(501));
      expect(component.form.get('descripcion')?.hasError('maxlength')).toBeTrue();
    });

    it('should expose mediosPago options', () => {
      expect(component.mediosPago.length).toBeGreaterThan(0);
      const values = component.mediosPago.map((m) => m.value);
      expect(values).toContain('efectivo');
      expect(values).toContain('transferencia');
    });
  });

  describe('onSubmit', () => {
    it('should emit formSubmit with valid data', () => {
      const emitSpy = spyOn(component.formSubmit, 'emit');

      component.form.patchValue({
        monto: 500,
        descripcion: 'Venta de rifas',
        responsableId: 'p1',
        medioPago: 'efectivo',
      });

      component.onSubmit();

      const expected: IngresoFormValue = {
        monto: 500,
        descripcion: 'Venta de rifas',
        responsableId: 'p1',
        medioPago: 'efectivo',
      };
      expect(emitSpy).toHaveBeenCalledWith(expected);
    });

    it('should convert monto to number', () => {
      const emitSpy = spyOn(component.formSubmit, 'emit');

      component.form.patchValue({
        monto: '750.50',
        descripcion: 'Test',
        responsableId: 'p1',
        medioPago: 'transferencia',
      });

      component.onSubmit();

      const call = emitSpy.calls.mostRecent().args[0] as IngresoFormValue;
      expect(typeof call.monto).toBe('number');
      expect(call.monto).toBe(750.5);
    });

    it('should NOT emit when form is invalid', () => {
      const emitSpy = spyOn(component.formSubmit, 'emit');
      component.onSubmit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      component.onSubmit();
      expect(component.form.get('monto')?.touched).toBeTrue();
      expect(component.form.get('descripcion')?.touched).toBeTrue();
      expect(component.form.get('responsableId')?.touched).toBeTrue();
      expect(component.form.get('medioPago')?.touched).toBeTrue();
    });

    it('should reset form after successful submit', () => {
      component.form.patchValue({
        monto: 100,
        descripcion: 'Test',
        responsableId: 'p1',
        medioPago: 'efectivo',
      });

      component.onSubmit();

      expect(component.form.value.monto).toBe('');
      expect(component.form.value.descripcion).toBe('');
    });
  });

  describe('onCancel', () => {
    it('should emit cancel event', () => {
      const emitSpy = spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
