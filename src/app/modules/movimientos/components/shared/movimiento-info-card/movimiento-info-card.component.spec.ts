/**
 * MovimientoInfoCardComponent - Unit Tests
 * Dumb component - displays movimiento information
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovimientoInfoCardComponent } from './movimiento-info-card.component';
import { Movimiento } from '../../../../../shared/models';
import { TipoMovimientoEnum, ConceptoMovimiento, MedioPagoEnum, EstadoPago, PersonaType, EstadoPersona } from '../../../../../shared/enums';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('MovimientoInfoCardComponent', () => {
  let component: MovimientoInfoCardComponent;
  let fixture: ComponentFixture<MovimientoInfoCardComponent>;
  let compiled: DebugElement;

  const mockMovimientoIngreso: Movimiento = {
    id: '1',
    cajaId: 'caja-1',
    tipo: TipoMovimientoEnum.INGRESO,
    monto: 1500.50,
    concepto: ConceptoMovimiento.CUOTA_GRUPO,
    descripcion: 'Cuota mensual enero',
    responsableId: 'resp-1',
    responsable: {
      id: 'resp-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      fechaIngreso: new Date('2024-01-01'),
      tipo: PersonaType.EDUCADOR,
      estado: EstadoPersona.ACTIVO,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    medioPago: MedioPagoEnum.TRANSFERENCIA,
    requiereComprobante: true,
    comprobanteEntregado: true,
    estadoPago: EstadoPago.PAGADO,
    fecha: new Date('2026-01-15'),
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15')
  };

  const mockMovimientoEgreso: Movimiento = {
    ...mockMovimientoIngreso,
    id: '2',
    tipo: TipoMovimientoEnum.EGRESO,
    concepto: ConceptoMovimiento.GASTO_GENERAL,
    medioPago: MedioPagoEnum.EFECTIVO,
    estadoPago: EstadoPago.PENDIENTE_REEMBOLSO
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimientoInfoCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientoInfoCardComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Computed Properties', () => {
    describe('tipoColor', () => {
      it('should return "primary" for INGRESO', () => {
        component.movimiento = mockMovimientoIngreso;
        expect(component.tipoColor).toBe('primary');
      });

      it('should return "warn" for EGRESO', () => {
        component.movimiento = mockMovimientoEgreso;
        expect(component.tipoColor).toBe('warn');
      });
    });

    describe('tipoIcon', () => {
      it('should return "trending_up" for INGRESO', () => {
        component.movimiento = mockMovimientoIngreso;
        expect(component.tipoIcon).toBe('trending_up');
      });

      it('should return "trending_down" for EGRESO', () => {
        component.movimiento = mockMovimientoEgreso;
        expect(component.tipoIcon).toBe('trending_down');
      });
    });

    describe('estadoPagoColor', () => {
      it('should return "primary" for PAGADO', () => {
        component.movimiento = mockMovimientoIngreso;
        expect(component.estadoPagoColor).toBe('primary');
      });

      it('should return "accent" for PENDIENTE_REEMBOLSO', () => {
        component.movimiento = mockMovimientoEgreso;
        expect(component.estadoPagoColor).toBe('accent');
      });
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.movimiento = mockMovimientoIngreso;
      fixture.detectChanges();
    });

    it('should display tipo badge with correct text', () => {
      const tipoBadge = compiled.query(By.css('.tipo-text'));
      expect(tipoBadge.nativeElement.textContent.trim()).toBe('INGRESO');
    });

    it('should display tipo icon', () => {
      const tipoIcon = compiled.query(By.css('.tipo-badge mat-icon'));
      expect(tipoIcon.nativeElement.textContent.trim()).toBe('trending_up');
    });

    it('should display monto with currency format', () => {
      const montoAmount = compiled.query(By.css('.amount'));
      expect(montoAmount.nativeElement.textContent).toContain('1,500.50');
    });

    it('should display concepto label', () => {
      const conceptoValue = compiled.queryAll(By.css('.info-item .value'))[0];
      expect(conceptoValue.nativeElement.textContent.trim()).toBe('Cuota de Grupo');
    });

    it('should display fecha formatted', () => {
      const fechaValues = compiled.queryAll(By.css('.info-item .value'));
      const fechaValue = fechaValues[1]; // Second info-item is fecha
      expect(fechaValue.nativeElement.textContent).toContain('15/01/2026');
    });

    it('should display responsable name', () => {
      const responsableValues = compiled.queryAll(By.css('.info-item .value'));
      const responsableValue = responsableValues[2]; // Third info-item is responsable
      expect(responsableValue.nativeElement.textContent).toContain('Juan');
      expect(responsableValue.nativeElement.textContent).toContain('Pérez');
    });

    it('should display medio de pago label', () => {
      const medioPagoValues = compiled.queryAll(By.css('.info-item .value'));
      const medioPagoValue = medioPagoValues[3];
      expect(medioPagoValue.nativeElement.textContent.trim()).toBe('Transferencia');
    });

    it('should display estado de pago chip', () => {
      const estadoChip = compiled.query(By.css('mat-chip'));
      expect(estadoChip.nativeElement.textContent).toContain('Pagado');
    });

    it('should display descripcion when provided', () => {
      const descripcionItem = compiled.query(By.css('.info-item.full-width'));
      expect(descripcionItem).toBeTruthy();
      expect(descripcionItem.nativeElement.textContent).toContain('Cuota mensual enero');
    });

    it('should NOT display descripcion when not provided', () => {
      component.movimiento = { ...mockMovimientoIngreso, descripcion: undefined };
      fixture.detectChanges();

      const descripcionItem = compiled.query(By.css('.info-item.full-width'));
      expect(descripcionItem).toBeFalsy();
    });

    it('should display comprobante status when required', () => {
      const comprobanteChips = compiled.queryAll(By.css('mat-chip'));
      // First chip is estado pago, second is comprobante
      expect(comprobanteChips.length).toBeGreaterThan(1);
      expect(comprobanteChips[1].nativeElement.textContent).toContain('Entregado');
    });

    it('should NOT display comprobante when not required', () => {
      component.movimiento = { ...mockMovimientoIngreso, requiereComprobante: false };
      fixture.detectChanges();

      const comprobanteChips = compiled.queryAll(By.css('mat-chip'));
      // Should only have estado pago chip
      expect(comprobanteChips.length).toBe(1);
    });

    it('should display metadata timestamps', () => {
      const metadata = compiled.queryAll(By.css('.metadata small'));
      expect(metadata.length).toBe(2);
      expect(metadata[0].nativeElement.textContent).toContain('Creado:');
      expect(metadata[1].nativeElement.textContent).toContain('Actualizado:');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct color class to tipo badge for INGRESO', () => {
      component.movimiento = mockMovimientoIngreso;
      fixture.detectChanges();

      const tipoBadge = compiled.query(By.css('.tipo-text'));
      expect(tipoBadge.nativeElement.classList.contains('primary')).toBe(true);
    });

    it('should apply correct color class to tipo badge for EGRESO', () => {
      component.movimiento = mockMovimientoEgreso;
      fixture.detectChanges();

      const tipoBadge = compiled.query(By.css('.tipo-text'));
      expect(tipoBadge.nativeElement.classList.contains('warn')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle movimiento without responsable', () => {
      component.movimiento = { ...mockMovimientoIngreso, responsable: undefined };
      fixture.detectChanges();

      // Should not crash, just display empty
      expect(component).toBeTruthy();
    });

    it('should handle movimiento without caja', () => {
      component.movimiento = { ...mockMovimientoIngreso, caja: undefined };
      fixture.detectChanges();

      const cajaValue = compiled.queryAll(By.css('.info-item .value'))[5]; // Caja is 6th item
      expect(cajaValue.nativeElement.textContent.trim()).toBe('N/A');
    });

    it('should handle movimiento without personaAReembolsar', () => {
      component.movimiento = { ...mockMovimientoIngreso, personaAReembolsar: undefined };
      fixture.detectChanges();

      // Should not show the field at all
      const allInfoItems = compiled.queryAll(By.css('.info-item'));
      const reembolsoItem = allInfoItems.find(item =>
        item.nativeElement.textContent.includes('A Reembolsar')
      );
      expect(reembolsoItem).toBeUndefined();
    });
  });
});
