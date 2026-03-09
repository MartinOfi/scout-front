/**
 * ResumenFinancieroComponent - Unit Tests
 * Dumb component - simple calculations and display
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumenFinancieroComponent } from './resumen-financiero.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ResumenFinancieroComponent', () => {
  let component: ResumenFinancieroComponent;
  let fixture: ComponentFixture<ResumenFinancieroComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenFinancieroComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumenFinancieroComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Computed Properties', () => {
    describe('resultadoNeto', () => {
      it('should calculate positive resultado neto correctly', () => {
        component.totalIngresos = 1000;
        component.totalEgresos = 400;
        expect(component.resultadoNeto).toBe(600);
      });

      it('should calculate negative resultado neto correctly', () => {
        component.totalIngresos = 500;
        component.totalEgresos = 800;
        expect(component.resultadoNeto).toBe(-300);
      });

      it('should calculate zero resultado neto correctly', () => {
        component.totalIngresos = 500;
        component.totalEgresos = 500;
        expect(component.resultadoNeto).toBe(0);
      });

      it('should handle zero ingresos', () => {
        component.totalIngresos = 0;
        component.totalEgresos = 100;
        expect(component.resultadoNeto).toBe(-100);
      });

      it('should handle zero egresos', () => {
        component.totalIngresos = 100;
        component.totalEgresos = 0;
        expect(component.resultadoNeto).toBe(100);
      });
    });

    describe('esPositivo', () => {
      it('should return true when resultado is positive', () => {
        component.totalIngresos = 1000;
        component.totalEgresos = 400;
        expect(component.esPositivo).toBe(true);
      });

      it('should return false when resultado is negative', () => {
        component.totalIngresos = 400;
        component.totalEgresos = 1000;
        expect(component.esPositivo).toBe(false);
      });

      it('should return true when resultado is zero (break-even)', () => {
        component.totalIngresos = 500;
        component.totalEgresos = 500;
        expect(component.esPositivo).toBe(true);
      });
    });
  });

  describe('Template Rendering', () => {
    it('should display total ingresos correctly', () => {
      component.totalIngresos = 1234.56;
      component.totalEgresos = 0;
      fixture.detectChanges();

      const ingresosValue = compiled.queryAll(By.css('.resumen-item.ingresos .value'))[0];
      expect(ingresosValue.nativeElement.textContent).toContain('1,234.56');
    });

    it('should display total egresos correctly', () => {
      component.totalIngresos = 0;
      component.totalEgresos = 987.65;
      fixture.detectChanges();

      const egresosValue = compiled.queryAll(By.css('.resumen-item.egresos .value'))[0];
      expect(egresosValue.nativeElement.textContent).toContain('987.65');
    });

    it('should display resultado neto correctly', () => {
      component.totalIngresos = 1000;
      component.totalEgresos = 400;
      fixture.detectChanges();

      const resultadoValue = compiled.queryAll(By.css('.resumen-item.resultado .value'))[0];
      expect(resultadoValue.nativeElement.textContent).toContain('600.00');
    });

    it('should display correct icons', () => {
      component.totalIngresos = 1000;
      component.totalEgresos = 400;
      fixture.detectChanges();

      const icons = compiled.queryAll(By.css('mat-icon'));
      expect(icons[0].nativeElement.textContent.trim()).toBe('trending_up');
      expect(icons[1].nativeElement.textContent.trim()).toBe('trending_down');
      expect(icons[2].nativeElement.textContent.trim()).toBe('check_circle'); // positivo
    });

    it('should show error icon when resultado is negative', () => {
      component.totalIngresos = 400;
      component.totalEgresos = 1000;
      fixture.detectChanges();

      const resultadoIcon = compiled.queryAll(By.css('mat-icon'))[2];
      expect(resultadoIcon.nativeElement.textContent.trim()).toBe('error');
    });
  });

  describe('CSS Classes', () => {
    it('should apply "positivo" class when resultado is positive', () => {
      component.totalIngresos = 1000;
      component.totalEgresos = 400;
      fixture.detectChanges();

      const resultadoItem = compiled.query(By.css('.resumen-item.resultado'));
      expect(resultadoItem.nativeElement.classList.contains('positivo')).toBe(true);
      expect(resultadoItem.nativeElement.classList.contains('negativo')).toBe(false);
    });

    it('should apply "negativo" class when resultado is negative', () => {
      component.totalIngresos = 400;
      component.totalEgresos = 1000;
      fixture.detectChanges();

      const resultadoItem = compiled.query(By.css('.resumen-item.resultado'));
      expect(resultadoItem.nativeElement.classList.contains('negativo')).toBe(true);
      expect(resultadoItem.nativeElement.classList.contains('positivo')).toBe(false);
    });

    it('should apply "positivo" class when resultado is zero', () => {
      component.totalIngresos = 500;
      component.totalEgresos = 500;
      fixture.detectChanges();

      const resultadoItem = compiled.query(By.css('.resumen-item.resultado'));
      expect(resultadoItem.nativeElement.classList.contains('positivo')).toBe(true);
    });
  });

  describe('Mat-Icon Colors', () => {
    it('should apply "primary" color to ingresos icon', () => {
      component.totalIngresos = 1000;
      component.totalEgresos = 0;
      fixture.detectChanges();

      const ingresosIcon = compiled.queryAll(By.css('.resumen-item.ingresos mat-icon'))[0];
      expect(ingresosIcon.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });

    it('should apply "warn" color to egresos icon', () => {
      component.totalIngresos = 0;
      component.totalEgresos = 1000;
      fixture.detectChanges();

      const egresosIcon = compiled.queryAll(By.css('.resumen-item.egresos mat-icon'))[0];
      expect(egresosIcon.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });

    it('should apply "primary" color to resultado icon when positive', () => {
      component.totalIngresos = 1000;
      component.totalEgresos = 400;
      fixture.detectChanges();

      const resultadoIcon = compiled.queryAll(By.css('.resumen-item.resultado mat-icon'))[0];
      expect(resultadoIcon.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });

    it('should apply "warn" color to resultado icon when negative', () => {
      component.totalIngresos = 400;
      component.totalEgresos = 1000;
      fixture.detectChanges();

      const resultadoIcon = compiled.queryAll(By.css('.resumen-item.resultado mat-icon'))[0];
      expect(resultadoIcon.nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });
});
