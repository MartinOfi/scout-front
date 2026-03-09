/**
 * VentaRegistroComponent - Unit Tests
 * Dumb component with form - sale registration
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { VentaRegistroComponent } from './venta-registro.component';
import { Producto, Persona, CreateVentaProductoDto } from '../../../../../shared/models';
import { PersonaType, EstadoPersona } from '../../../../../shared/enums';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('VentaRegistroComponent', () => {
  let component: VentaRegistroComponent;
  let fixture: ComponentFixture<VentaRegistroComponent>;
  let compiled: DebugElement;

  const mockProductos: Producto[] = [
    {
      id: 'prod-1',
      eventoId: 'evento-1',
      nombre: 'Empanadas',
      precioVenta: 100,
      precioCosto: 60,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'prod-2',
      eventoId: 'evento-1',
      nombre: 'Tortas',
      precioVenta: 200,
      precioCosto: 120,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockPersonas: Persona[] = [
    {
      id: 'pers-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      fechaIngreso: new Date('2024-01-01'),
      tipo: PersonaType.PROTAGONISTA,
      estado: EstadoPersona.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'pers-2',
      nombre: 'María',
      apellido: 'López',
      dni: '12345678',
      fechaIngreso: new Date('2024-01-01'),
      tipo: PersonaType.PROTAGONISTA,
      estado: EstadoPersona.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaRegistroComponent, ReactiveFormsModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(VentaRegistroComponent);
    component = fixture.componentInstance;
    component.productos = mockProductos;
    component.personas = mockPersonas;
    fixture.detectChanges();
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.form.value).toEqual({
        productoId: '',
        personaId: '',
        cantidad: 1
      });
    });

    it('should have required validators', () => {
      const productoId = component.form.get('productoId');
      const personaId = component.form.get('personaId');
      const cantidad = component.form.get('cantidad');

      productoId?.setValue('');
      personaId?.setValue('');
      cantidad?.setValue('');

      expect(productoId?.hasError('required')).toBe(true);
      expect(personaId?.hasError('required')).toBe(true);
      expect(cantidad?.hasError('required')).toBe(true);
    });

    it('should have min validator on cantidad', () => {
      const cantidad = component.form.get('cantidad');
      cantidad?.setValue(0);

      expect(cantidad?.hasError('min')).toBe(true);
    });

    it('should default cantidad to 1', () => {
      expect(component.form.get('cantidad')?.value).toBe(1);
    });
  });

  describe('Computed Properties', () => {
    describe('productoSeleccionado', () => {
      it('should return undefined when no producto selected', () => {
        expect(component.productoSeleccionado).toBeUndefined();
      });

      it('should return selected producto', () => {
        component.form.patchValue({ productoId: 'prod-1' });
        expect(component.productoSeleccionado).toEqual(mockProductos[0]);
      });

      it('should return undefined when invalid id', () => {
        component.form.patchValue({ productoId: 'invalid-id' });
        expect(component.productoSeleccionado).toBeUndefined();
      });
    });

    describe('totalVenta', () => {
      it('should calculate total correctly', () => {
        component.form.patchValue({
          productoId: 'prod-1',
          cantidad: 3
        });

        expect(component.totalVenta).toBe(300); // 100 * 3
      });

      it('should return 0 when no producto selected', () => {
        component.form.patchValue({ cantidad: 5 });
        expect(component.totalVenta).toBe(0);
      });

      it('should return 0 when cantidad is 0', () => {
        component.form.patchValue({
          productoId: 'prod-1',
          cantidad: 0
        });
        expect(component.totalVenta).toBe(0);
      });

      it('should handle large quantities', () => {
        component.form.patchValue({
          productoId: 'prod-2', // precio 200
          cantidad: 100
        });
        expect(component.totalVenta).toBe(20000);
      });
    });

    describe('ganancia', () => {
      it('should calculate ganancia correctly', () => {
        component.form.patchValue({
          productoId: 'prod-1', // venta: 100, costo: 60
          cantidad: 5
        });

        expect(component.ganancia).toBe(200); // (100-60) * 5
      });

      it('should return 0 when no producto selected', () => {
        component.form.patchValue({ cantidad: 5 });
        expect(component.ganancia).toBe(0);
      });

      it('should handle negative margins', () => {
        const prodPerdida: Producto = {
          ...mockProductos[0],
          precioVenta: 50,
          precioCosto: 80
        };
        component.productos = [prodPerdida];
        component.form.patchValue({
          productoId: prodPerdida.id,
          cantidad: 2
        });

        expect(component.ganancia).toBe(-60); // (50-80) * 2
      });
    });
  });

  describe('onSubmit Method', () => {
    it('should emit submit event with valid form', () => {
      vi.spyOn(component.submit, 'emit');

      component.form.patchValue({
        productoId: 'prod-1',
        personaId: 'pers-1',
        cantidad: 5
      });

      component.onSubmit();

      expect(component.submit.emit).toHaveBeenCalledWith({
        productoId: 'prod-1',
        personaId: 'pers-1',
        cantidad: 5
      } as CreateVentaProductoDto);
    });

    it('should NOT emit when form is invalid', () => {
      vi.spyOn(component.submit, 'emit');

      component.form.patchValue({
        productoId: '',
        personaId: '',
        cantidad: ''
      });

      component.onSubmit();

      expect(component.submit.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      component.form.patchValue({
        productoId: '',
        personaId: '',
        cantidad: ''
      });

      component.onSubmit();

      expect(component.form.get('productoId')?.touched).toBe(true);
      expect(component.form.get('personaId')?.touched).toBe(true);
      expect(component.form.get('cantidad')?.touched).toBe(true);
    });

    it('should reset form after successful submit', () => {
      component.form.patchValue({
        productoId: 'prod-1',
        personaId: 'pers-1',
        cantidad: 5
      });

      component.onSubmit();

      expect(component.form.value).toEqual({
        productoId: null,
        personaId: null,
        cantidad: 1 // Reset to default
      });
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
    it('should display form title', () => {
      const title = compiled.query(By.css('h3'));
      expect(title.nativeElement.textContent).toContain('Registrar Venta');
    });

    it('should display producto select', () => {
      const productoSelect = compiled.query(By.css('mat-select[formControlName="productoId"]'));
      expect(productoSelect).toBeTruthy();
    });

    it('should display all productos in select', () => {
      const options = compiled.queryAll(By.css('mat-option'));
      expect(options.length).toBeGreaterThanOrEqual(2);
    });

    it('should display persona select', () => {
      const personaSelect = compiled.query(By.css('mat-select[formControlName="personaId"]'));
      expect(personaSelect).toBeTruthy();
    });

    it('should display cantidad input', () => {
      const cantidadInput = compiled.query(By.css('input[formControlName="cantidad"]'));
      expect(cantidadInput).toBeTruthy();
    });

    it('should display summary when producto selected', () => {
      component.form.patchValue({ productoId: 'prod-1' });
      fixture.detectChanges();

      const summary = compiled.query(By.css('.summary'));
      expect(summary).toBeTruthy();
    });

    it('should NOT display summary when no producto selected', () => {
      const summary = compiled.query(By.css('.summary'));
      expect(summary).toBeFalsy();
    });

    it('should display totalVenta in summary', () => {
      component.form.patchValue({
        productoId: 'prod-1',
        cantidad: 3
      });
      fixture.detectChanges();

      const summary = compiled.query(By.css('.summary'));
      expect(summary.nativeElement.textContent).toContain('300.00');
    });

    it('should display ganancia in summary', () => {
      component.form.patchValue({
        productoId: 'prod-1',
        cantidad: 5
      });
      fixture.detectChanges();

      const summary = compiled.query(By.css('.summary'));
      expect(summary.nativeElement.textContent).toContain('200.00');
    });

    it('should display cancel button', () => {
      const buttons = compiled.queryAll(By.css('button'));
      const cancelButton = buttons.find(btn =>
        btn.nativeElement.textContent.includes('Cancelar')
      );
      expect(cancelButton).toBeTruthy();
    });

    it('should display submit button', () => {
      const buttons = compiled.queryAll(By.css('button'));
      const submitButton = buttons.find(btn =>
        btn.nativeElement.textContent.includes('Registrar Venta')
      );
      expect(submitButton).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should call onSubmit when submit button clicked', () => {
      vi.spyOn(component, 'onSubmit');

      component.form.patchValue({
        productoId: 'prod-1',
        personaId: 'pers-1',
        cantidad: 3
      });
      fixture.detectChanges();

      const submitButton = compiled.queryAll(By.css('button')).find(btn =>
        btn.nativeElement.textContent.includes('Registrar Venta')
      );
      submitButton?.nativeElement.click();

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button clicked', () => {
      vi.spyOn(component, 'onCancel');

      const cancelButton = compiled.queryAll(By.css('button')).find(btn =>
        btn.nativeElement.textContent.includes('Cancelar')
      );
      cancelButton?.nativeElement.click();

      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should show validation errors when invalid and touched', () => {
      const productoControl = component.form.get('productoId');
      productoControl?.markAsTouched();
      productoControl?.setValue('');
      fixture.detectChanges();

      const error = compiled.query(By.css('mat-error'));
      expect(error).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty productos array', () => {
      component.productos = [];
      fixture.detectChanges();

      expect(component.productoSeleccionado).toBeUndefined();
      expect(component.totalVenta).toBe(0);
      expect(component.ganancia).toBe(0);
    });

    it('should handle empty personas array', () => {
      component.personas = [];
      fixture.detectChanges();

      expect(() => component.onSubmit()).not.toThrow();
    });

    it('should handle decimal cantidad values', () => {
      component.form.patchValue({
        productoId: 'prod-1',
        cantidad: 2.5
      });

      expect(component.totalVenta).toBe(250);
    });

    it('should handle very large cantidad', () => {
      component.form.patchValue({
        productoId: 'prod-1',
        cantidad: 1000
      });

      expect(component.totalVenta).toBe(100000);
    });
  });
});
