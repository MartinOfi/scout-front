/**
 * BonificacionBadgeComponent - Unit Tests
 * Dumb component - simple presentation logic
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BonificacionBadgeComponent } from './bonificacion-badge.component';
import { EstadoInscripcion } from '../../../../../shared/enums';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('BonificacionBadgeComponent', () => {
  let component: BonificacionBadgeComponent;
  let fixture: ComponentFixture<BonificacionBadgeComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonificacionBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BonificacionBadgeComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Color Chip Logic', () => {
    it('should return "primary" for PAGADO state', () => {
      component.estado = EstadoInscripcion.PAGADO;
      expect(component.colorChip).toBe('primary');
    });

    it('should return "primary" for BONIFICADO state', () => {
      component.estado = EstadoInscripcion.BONIFICADO;
      expect(component.colorChip).toBe('primary');
    });

    it('should return "accent" for PARCIAL state', () => {
      component.estado = EstadoInscripcion.PARCIAL;
      expect(component.colorChip).toBe('accent');
    });

    it('should return "warn" for PENDIENTE state', () => {
      component.estado = EstadoInscripcion.PENDIENTE;
      expect(component.colorChip).toBe('warn');
    });
  });

  describe('Template Rendering', () => {
    it('should display correct icon for PAGADO state', () => {
      component.estado = EstadoInscripcion.PAGADO;
      fixture.detectChanges();

      const icon = compiled.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('check_circle');
    });

    it('should display correct icon for BONIFICADO state', () => {
      component.estado = EstadoInscripcion.BONIFICADO;
      fixture.detectChanges();

      const icon = compiled.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('card_giftcard');
    });

    it('should display correct icon for PARCIAL state', () => {
      component.estado = EstadoInscripcion.PARCIAL;
      fixture.detectChanges();

      const icon = compiled.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('schedule');
    });

    it('should display correct icon for PENDIENTE state', () => {
      component.estado = EstadoInscripcion.PENDIENTE;
      fixture.detectChanges();

      const icon = compiled.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('error');
    });

    it('should display estado label', () => {
      component.estado = EstadoInscripcion.PAGADO;
      fixture.detectChanges();

      const label = compiled.query(By.css('.label'));
      expect(label.nativeElement.textContent.trim()).toBe('Pagado');
    });

    it('should display bonificacion amount when provided for BONIFICADO state', () => {
      component.estado = EstadoInscripcion.BONIFICADO;
      component.montoBonificado = 500;
      fixture.detectChanges();

      const bonificacion = compiled.query(By.css('.bonificacion'));
      expect(bonificacion).toBeTruthy();
      expect(bonificacion.nativeElement.textContent).toContain('500');
    });

    it('should NOT display bonificacion amount when not provided', () => {
      component.estado = EstadoInscripcion.BONIFICADO;
      component.montoBonificado = undefined;
      fixture.detectChanges();

      const bonificacion = compiled.query(By.css('.bonificacion'));
      expect(bonificacion).toBeFalsy();
    });

    it('should NOT display bonificacion amount for non-BONIFICADO states', () => {
      component.estado = EstadoInscripcion.PAGADO;
      component.montoBonificado = 500;
      fixture.detectChanges();

      const bonificacion = compiled.query(By.css('.bonificacion'));
      expect(bonificacion).toBeFalsy();
    });
  });

  describe('Mat-Chip Attributes', () => {
    it('should apply correct color attribute to mat-chip', () => {
      component.estado = EstadoInscripcion.PAGADO;
      fixture.detectChanges();

      const chip = compiled.query(By.css('mat-chip'));
      expect(chip.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });

    it('should have estado-badge class', () => {
      component.estado = EstadoInscripcion.PAGADO;
      fixture.detectChanges();

      const chip = compiled.query(By.css('mat-chip'));
      expect(chip.nativeElement.classList.contains('estado-badge')).toBe(true);
    });
  });
});
