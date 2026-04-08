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
    component.personasParaReembolsar = mockResponsables;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values except estadoPago and fecha', () => {
      expect(component.form.value.monto).toBe('');
      expect(component.form.value.descripcion).toBe('');
      expect(component.form.value.responsableId).toBe('');
      expect(component.form.value.medioPago).toBe('');
      expect(component.form.value.estadoPago).toBe(EstadoPago.PAGADO);
      expect(component.form.value.personaAReembolsarId).toBe('');
      // fecha defaults to today in YYYY-MM-DD format
      expect(component.form.value.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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

    it('should filter mediosPago to only efectivo and transferencia', () => {
      const values = component.mediosPago.map((m) => m.value);
      expect(values).toContain('efectivo');
      expect(values).toContain('transferencia');
      expect(values).not.toContain('saldo_personal');
    });
  });

  describe('Conditional personaAReembolsarId validator', () => {
    it('should NOT require personaAReembolsarId when estadoPago is pagado', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PAGADO });
      fixture.detectChanges();

      const ctrl = component.form.get('personaAReembolsarId');
      expect(ctrl?.hasError('required')).toBe(false);
    });

    it('should require personaAReembolsarId when estadoPago is pendiente_reembolso', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      fixture.detectChanges();

      const ctrl = component.form.get('personaAReembolsarId');
      expect(ctrl?.hasError('required')).toBe(true);
    });

    it('should clear personaAReembolsarId value when switching back to pagado', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      component.form.patchValue({ personaAReembolsarId: 'resp-1' });
      component.form.patchValue({ estadoPago: EstadoPago.PAGADO });
      fixture.detectChanges();

      expect(component.form.get('personaAReembolsarId')?.value).toBe('');
    });

    it('isPendienteReembolso should be true when estadoPago is pendiente_reembolso', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      expect(component.isPendienteReembolso).toBe(true);
    });

    it('isPendienteReembolso should be false when estadoPago is pagado', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PAGADO });
      expect(component.isPendienteReembolso).toBe(false);
    });
  });

  describe('onSubmit Method', () => {
    it('should emit formSubmit with valid form (pagado, no personaAReembolsarId)', () => {
      vi.spyOn(component.formSubmit, 'emit');

      component.form.patchValue({
        monto: 500,
        descripcion: 'Compra de alimentos',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO,
        fecha: '2026-04-08',
      });

      component.onSubmit();

      expect(component.formSubmit.emit).toHaveBeenCalledWith({
        monto: 500,
        descripcion: 'Compra de alimentos',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO,
        fecha: '2026-04-08',
        personaAReembolsarId: undefined
      });
    });

    it('should emit formSubmit with personaAReembolsarId when pendiente_reembolso', () => {
      vi.spyOn(component.formSubmit, 'emit');

      component.form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      component.form.patchValue({
        monto: 800,
        descripcion: 'Alquiler predio',
        responsableId: 'resp-1',
        medioPago: 'transferencia',
        fecha: '2026-04-08',
        personaAReembolsarId: 'resp-1'
      });

      component.onSubmit();

      expect(component.formSubmit.emit).toHaveBeenCalledWith({
        monto: 800,
        descripcion: 'Alquiler predio',
        responsableId: 'resp-1',
        medioPago: 'transferencia',
        estadoPago: EstadoPago.PENDIENTE_REEMBOLSO,
        fecha: '2026-04-08',
        personaAReembolsarId: 'resp-1'
      });
    });

    it('should NOT emit when pendiente_reembolso but no personaAReembolsarId', () => {
      vi.spyOn(component.formSubmit, 'emit');

      component.form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      component.form.patchValue({
        monto: 500,
        descripcion: 'Test',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        fecha: '2026-04-08',
        // personaAReembolsarId intentionally empty
      });

      component.onSubmit();
      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should NOT emit when form is invalid', () => {
      vi.spyOn(component.formSubmit, 'emit');
      component.onSubmit();
      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      component.onSubmit();

      expect(component.form.get('monto')?.touched).toBe(true);
      expect(component.form.get('descripcion')?.touched).toBe(true);
      expect(component.form.get('responsableId')?.touched).toBe(true);
      expect(component.form.get('medioPago')?.touched).toBe(true);
    });

    it('should convert monto to number', () => {
      vi.spyOn(component.formSubmit, 'emit');

      component.form.patchValue({
        monto: '500.50',
        descripcion: 'Test',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO,
        fecha: '2026-04-08',
      });

      component.onSubmit();

      const emittedData = (component.formSubmit.emit as ReturnType<typeof vi.spyOn>).mock.calls[0][0];
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
      const selects = fixture.nativeElement.querySelectorAll('select');
      const textareas = fixture.nativeElement.querySelectorAll('textarea');

      expect(inputs.length).toBeGreaterThan(0);
      expect(selects.length).toBeGreaterThan(0);
      expect(textareas.length).toBeGreaterThan(0);
    });

    it('should show personaAReembolsarId field when estadoPago is pendiente_reembolso', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PENDIENTE_REEMBOLSO });
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('#persona-reembolsar-select');
      expect(el).toBeTruthy();
    });

    it('should hide personaAReembolsarId field when estadoPago is pagado', () => {
      component.form.patchValue({ estadoPago: EstadoPago.PAGADO });
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('#persona-reembolsar-select');
      expect(el).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty responsables array', () => {
      component.responsables = [];
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should handle decimal monto values', () => {
      vi.spyOn(component.formSubmit, 'emit');

      component.form.patchValue({
        monto: 123.45,
        descripcion: 'Test',
        responsableId: 'resp-1',
        medioPago: 'efectivo',
        estadoPago: EstadoPago.PAGADO,
        fecha: '2026-04-08',
      });

      component.onSubmit();

      expect(component.formSubmit.emit).toHaveBeenCalled();
    });
  });
});
