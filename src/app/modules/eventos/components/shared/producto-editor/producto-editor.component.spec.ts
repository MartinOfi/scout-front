/**
 * ProductoEditorComponent - Unit Tests
 * Dumb component with form - product management
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProductoEditorComponent } from './producto-editor.component';
import { Producto, CreateProductoDto } from '../../../../../shared/models';
import { ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductoEditorComponent', () => {
  let component: ProductoEditorComponent;
  let fixture: ComponentFixture<ProductoEditorComponent>;
  let compiled: DebugElement;

  const mockProductos: Producto[] = [
    {
      id: '1',
      eventoId: 'evento-1',
      nombre: 'Empanadas',
      precioVenta: 100,
      precioCosto: 60,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      eventoId: 'evento-1',
      nombre: 'Tortas',
      precioVenta: 200,
      precioCosto: 120,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoEditorComponent, ReactiveFormsModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoEditorComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.form.value).toEqual({
        nombre: '',
        precioCosto: '',
        precioVenta: ''
      });
    });

    it('should have required validators on all fields', () => {
      const nombre = component.form.get('nombre');
      const precioCosto = component.form.get('precioCosto');
      const precioVenta = component.form.get('precioVenta');

      nombre?.setValue('');
      precioCosto?.setValue('');
      precioVenta?.setValue('');

      expect(nombre?.hasError('required')).toBe(true);
      expect(precioCosto?.hasError('required')).toBe(true);
      expect(precioVenta?.hasError('required')).toBe(true);
    });

    it('should have minLength validator on nombre', () => {
      const nombre = component.form.get('nombre');
      nombre?.setValue('A'); // Only 1 character

      expect(nombre?.hasError('minlength')).toBe(true);
    });

    it('should accept valid form values', () => {
      component.form.patchValue({
        nombre: 'Empanadas',
        precioCosto: 50,
        precioVenta: 100
      });

      expect(component.form.valid).toBe(true);
    });
  });

  describe('Calculation Methods', () => {
    describe('calcularMargen', () => {
      it('should calculate margen correctly', () => {
        const producto = mockProductos[0];
        const margen = component.calcularMargen(producto);
        expect(margen).toBe(40); // 100 - 60
      });

      it('should handle negative margen', () => {
        const producto: Producto = {
          ...mockProductos[0],
          precioVenta: 50,
          precioCosto: 80
        };
        const margen = component.calcularMargen(producto);
        expect(margen).toBe(-30);
      });

      it('should handle zero margen', () => {
        const producto: Producto = {
          ...mockProductos[0],
          precioVenta: 100,
          precioCosto: 100
        };
        const margen = component.calcularMargen(producto);
        expect(margen).toBe(0);
      });
    });

    describe('calcularPorcentajeMargen', () => {
      it('should calculate porcentaje margen correctly', () => {
        const producto = mockProductos[0];
        const porcentaje = component.calcularPorcentajeMargen(producto);
        expect(porcentaje).toBeCloseTo(66.67, 1); // (100-60)/60 * 100
      });

      it('should return 0 when costo is 0', () => {
        const producto: Producto = {
          ...mockProductos[0],
          precioCosto: 0,
          precioVenta: 100
        };
        const porcentaje = component.calcularPorcentajeMargen(producto);
        expect(porcentaje).toBe(0);
      });

      it('should handle negative percentage', () => {
        const producto: Producto = {
          ...mockProductos[0],
          precioVenta: 50,
          precioCosto: 80
        };
        const porcentaje = component.calcularPorcentajeMargen(producto);
        expect(porcentaje).toBeCloseTo(-37.5, 1);
      });
    });
  });

  describe('onAdd Method', () => {
    it('should emit addProducto event with valid form', () => {
      vi.spyOn(component.addProducto, 'emit');

      component.form.patchValue({
        nombre: 'Empanadas',
        precioCosto: 60,
        precioVenta: 100
      });

      component.onAdd();

      expect(component.addProducto.emit).toHaveBeenCalledWith({
        nombre: 'Empanadas',
        precioCosto: 60,
        precioVenta: 100
      } as CreateProductoDto);
    });

    it('should NOT emit when form is invalid', () => {
      vi.spyOn(component.addProducto, 'emit');

      component.form.patchValue({
        nombre: '',
        precioCosto: '',
        precioVenta: ''
      });

      component.onAdd();

      expect(component.addProducto.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      component.form.patchValue({
        nombre: '',
        precioCosto: '',
        precioVenta: ''
      });

      component.onAdd();

      expect(component.form.get('nombre')?.touched).toBe(true);
      expect(component.form.get('precioCosto')?.touched).toBe(true);
      expect(component.form.get('precioVenta')?.touched).toBe(true);
    });

    it('should reset form after successful add', () => {
      component.form.patchValue({
        nombre: 'Empanadas',
        precioCosto: 60,
        precioVenta: 100
      });

      component.onAdd();

      expect(component.form.value).toEqual({
        nombre: null,
        precioCosto: null,
        precioVenta: null
      });
    });
  });

  describe('onRemove Method', () => {
    it('should emit removeProducto event with correct id', () => {
      vi.spyOn(component.removeProducto, 'emit');

      component.onRemove('producto-123');

      expect(component.removeProducto.emit).toHaveBeenCalledWith('producto-123');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.productos = mockProductos;
      fixture.detectChanges();
    });

    it('should display add form fields', () => {
      const nombreInput = compiled.query(By.css('input[formControlName="nombre"]'));
      const costoInput = compiled.query(By.css('input[formControlName="precioCosto"]'));
      const ventaInput = compiled.query(By.css('input[formControlName="precioVenta"]'));

      expect(nombreInput).toBeTruthy();
      expect(costoInput).toBeTruthy();
      expect(ventaInput).toBeTruthy();
    });

    it('should display productos table', () => {
      const table = compiled.query(By.css('.productos-table'));
      expect(table).toBeTruthy();
    });

    it('should display all productos in table', () => {
      const rows = compiled.queryAll(By.css('tr[mat-row]'));
      expect(rows.length).toBe(2);
    });

    it('should display producto details in table', () => {
      const firstRow = compiled.queryAll(By.css('tr[mat-row]'))[0];
      expect(firstRow.nativeElement.textContent).toContain('Empanadas');
      expect(firstRow.nativeElement.textContent).toContain('60.00');
      expect(firstRow.nativeElement.textContent).toContain('100.00');
    });

    it('should display calculated margen', () => {
      const firstRow = compiled.queryAll(By.css('tr[mat-row]'))[0];
      expect(firstRow.nativeElement.textContent).toContain('40.00'); // Margen
    });

    it('should display calculated porcentaje margen', () => {
      const firstRow = compiled.queryAll(By.css('tr[mat-row]'))[0];
      expect(firstRow.nativeElement.textContent).toContain('67%'); // Porcentaje
    });

    it('should display delete button for each producto', () => {
      const deleteButtons = compiled.queryAll(By.css('button[color="warn"]'));
      expect(deleteButtons.length).toBe(2);
    });

    it('should display empty state when no productos', () => {
      component.productos = [];
      fixture.detectChanges();

      const emptyState = compiled.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No hay productos agregados');
    });

    it('should NOT display empty state when productos exist', () => {
      const emptyState = compiled.query(By.css('.empty-state'));
      expect(emptyState).toBeFalsy();
    });
  });

  describe('Form Interaction', () => {
    it('should update form when typing in nombre input', () => {
      const nombreInput = compiled.query(By.css('input[formControlName="nombre"]'));
      const inputElement = nombreInput.nativeElement as HTMLInputElement;

      inputElement.value = 'Pizza';
      inputElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.form.get('nombre')?.value).toBe('Pizza');
    });

    it('should show validation errors when form is invalid and touched', () => {
      const nombreControl = component.form.get('nombre');
      nombreControl?.markAsTouched();
      nombreControl?.setValue('');
      fixture.detectChanges();

      const error = compiled.query(By.css('mat-error'));
      expect(error).toBeTruthy();
    });

    it('should call onAdd when add button is clicked', () => {
      vi.spyOn(component, 'onAdd');

      component.form.patchValue({
        nombre: 'Test',
        precioCosto: 50,
        precioVenta: 100
      });
      fixture.detectChanges();

      const addButton = compiled.query(By.css('button[color="primary"]'));
      addButton.nativeElement.click();

      expect(component.onAdd).toHaveBeenCalled();
    });

    it('should call onRemove when delete button is clicked', () => {
      vi.spyOn(component, 'onRemove');

      const deleteButton = compiled.queryAll(By.css('button[color="warn"]'))[0];
      deleteButton.nativeElement.click();

      expect(component.onRemove).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle productos with 0 prices', () => {
      const zeroProducto: Producto = {
        ...mockProductos[0],
        precioVenta: 0,
        precioCosto: 0
      };
      component.productos = [zeroProducto];
      fixture.detectChanges();

      expect(component.calcularMargen(zeroProducto)).toBe(0);
      expect(component.calcularPorcentajeMargen(zeroProducto)).toBe(0);
    });

    it('should handle very large numbers', () => {
      component.form.patchValue({
        nombre: 'Expensive Item',
        precioCosto: 999999.99,
        precioVenta: 1000000.00
      });

      expect(component.form.valid).toBe(true);
    });

    it('should handle decimal values correctly', () => {
      component.form.patchValue({
        nombre: 'Item',
        precioCosto: 50.75,
        precioVenta: 100.25
      });

      expect(component.form.valid).toBe(true);
    });
  });
});
