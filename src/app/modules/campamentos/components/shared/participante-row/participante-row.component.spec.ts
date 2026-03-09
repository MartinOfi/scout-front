/**
 * ParticipanteRowComponent - Unit Tests
 * Dumb component - displays participant with payment status
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ParticipanteRowComponent } from './participante-row.component';
import { PagoParticipante } from '../../../../../shared/models';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ParticipanteRowComponent', () => {
  let component: ParticipanteRowComponent;
  let fixture: ComponentFixture<ParticipanteRowComponent>;
  let compiled: DebugElement;

  const mockParticipantePagado: PagoParticipante = {
    participanteId: 'part-1',
    participanteNombre: 'Juan Pérez',
    costoPorPersona: 1000,
    totalPagado: 1000,
    saldoPendiente: 0,
    pagos: [
      {
        fecha: new Date(),
        monto: 1000,
        medioPago: 'efectivo'
      }
    ]
  };

  const mockParticipanteParcial: PagoParticipante = {
    participanteId: 'part-2',
    participanteNombre: 'María López',
    costoPorPersona: 1000,
    totalPagado: 500,
    saldoPendiente: 500,
    pagos: [
      {
        fecha: new Date(),
        monto: 500,
        medioPago: 'transferencia'
      }
    ]
  };

  const mockParticipantePendiente: PagoParticipante = {
    participanteId: 'part-3',
    participanteNombre: 'Carlos García',
    costoPorPersona: 1000,
    totalPagado: 0,
    saldoPendiente: 1000,
    pagos: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipanteRowComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipanteRowComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Computed Properties', () => {
    describe('montoAdeudado', () => {
      it('should return saldoPendiente', () => {
        component.participante = mockParticipanteParcial;
        expect(component.montoAdeudado).toBe(500);
      });

      it('should return 0 when fully paid', () => {
        component.participante = mockParticipantePagado;
        expect(component.montoAdeudado).toBe(0);
      });
    });

    describe('porcentajePagado', () => {
      it('should calculate 100% when fully paid', () => {
        component.participante = mockParticipantePagado;
        expect(component.porcentajePagado).toBe(100);
      });

      it('should calculate 50% when half paid', () => {
        component.participante = mockParticipanteParcial;
        expect(component.porcentajePagado).toBe(50);
      });

      it('should calculate 0% when not paid', () => {
        component.participante = mockParticipantePendiente;
        expect(component.porcentajePagado).toBe(0);
      });

      it('should return 0 when costoPorPersona is 0', () => {
        const participante = { ...mockParticipantePagado, costoPorPersona: 0 };
        component.participante = participante;
        expect(component.porcentajePagado).toBe(0);
      });
    });

    describe('estadoPago', () => {
      it('should return "completo" when fully paid', () => {
        component.participante = mockParticipantePagado;
        expect(component.estadoPago).toBe('completo');
      });

      it('should return "parcial" when partially paid', () => {
        component.participante = mockParticipanteParcial;
        expect(component.estadoPago).toBe('parcial');
      });

      it('should return "pendiente" when not paid', () => {
        component.participante = mockParticipantePendiente;
        expect(component.estadoPago).toBe('pendiente');
      });
    });
  });

  describe('Event Emitters', () => {
    beforeEach(() => {
      component.participante = mockParticipantePagado;
    });

    describe('onRegistrarPago', () => {
      it('should emit registrarPago with participanteId', () => {
        vi.spyOn(component.registrarPago, 'emit');

        component.onRegistrarPago();

        expect(component.registrarPago.emit).toHaveBeenCalledWith('part-1');
      });
    });

    describe('onRemove', () => {
      it('should emit remove with participanteId', () => {
        vi.spyOn(component.remove, 'emit');

        component.onRemove();

        expect(component.remove.emit).toHaveBeenCalledWith('part-1');
      });
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.participante = mockParticipanteParcial;
      fixture.detectChanges();
    });

    it('should display participante name', () => {
      const nameElement = compiled.query(By.css('.name'));
      expect(nameElement.nativeElement.textContent).toContain('María López');
    });

    it('should display costoPorPersona', () => {
      const detailsElement = compiled.query(By.css('.details'));
      expect(detailsElement.nativeElement.textContent).toContain('1,000.00');
    });

    it('should display totalPagado', () => {
      const detailsElement = compiled.query(By.css('.details'));
      expect(detailsElement.nativeElement.textContent).toContain('Pagado:');
      expect(detailsElement.nativeElement.textContent).toContain('500.00');
    });

    it('should display montoAdeudado', () => {
      const detailsElement = compiled.query(By.css('.details'));
      expect(detailsElement.nativeElement.textContent).toContain('Adeuda:');
      expect(detailsElement.nativeElement.textContent).toContain('500.00');
    });

    it('should display progress bar', () => {
      const progressBar = compiled.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeTruthy();
    });

    it('should set progress bar value correctly', () => {
      const progressBar = compiled.query(By.css('mat-progress-bar'));
      expect(progressBar.componentInstance.value).toBe(50);
    });

    it('should display percentage text', () => {
      const percentage = compiled.query(By.css('.percentage'));
      expect(percentage.nativeElement.textContent).toContain('50%');
    });

    it('should display estado chip with correct text', () => {
      const chip = compiled.query(By.css('mat-chip'));
      expect(chip.nativeElement.textContent.trim()).toBe('Parcial');
    });

    it('should display registrar pago button', () => {
      const buttons = compiled.queryAll(By.css('button'));
      const pagoButton = buttons.find(btn =>
        btn.nativeElement.getAttribute('matTooltip')?.includes('Registrar Pago')
      );
      expect(pagoButton).toBeTruthy();
    });

    it('should display remove button', () => {
      const buttons = compiled.queryAll(By.css('button'));
      const removeButton = buttons.find(btn =>
        btn.nativeElement.getAttribute('matTooltip')?.includes('Remover')
      );
      expect(removeButton).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should disable registrar pago button when completo', () => {
      component.participante = mockParticipantePagado;
      fixture.detectChanges();

      const buttons = compiled.queryAll(By.css('button'));
      const pagoButton: HTMLButtonElement = buttons.find(btn =>
        btn.nativeElement.getAttribute('matTooltip')?.includes('Registrar Pago')
      )?.nativeElement;

      expect(pagoButton?.disabled).toBe(true);
    });

    it('should enable registrar pago button when not completo', () => {
      component.participante = mockParticipanteParcial;
      fixture.detectChanges();

      const buttons = compiled.queryAll(By.css('button'));
      const pagoButton: HTMLButtonElement = buttons.find(btn =>
        btn.nativeElement.getAttribute('matTooltip')?.includes('Registrar Pago')
      )?.nativeElement;

      expect(pagoButton?.disabled).toBe(false);
    });

    it('should never disable remove button', () => {
      component.participante = mockParticipantePagado;
      fixture.detectChanges();

      const buttons = compiled.queryAll(By.css('button'));
      const removeButton: HTMLButtonElement = buttons.find(btn =>
        btn.nativeElement.getAttribute('matTooltip')?.includes('Remover')
      )?.nativeElement;

      expect(removeButton?.disabled).toBe(false);
    });
  });

  describe('Progress Bar Colors', () => {
    it('should use "primary" color when completo', () => {
      component.participante = mockParticipantePagado;
      fixture.detectChanges();

      const progressBar = compiled.query(By.css('mat-progress-bar'));
      expect(progressBar.componentInstance.color).toBe('primary');
    });

    it('should use "accent" color when not completo', () => {
      component.participante = mockParticipanteParcial;
      fixture.detectChanges();

      const progressBar = compiled.query(By.css('mat-progress-bar'));
      expect(progressBar.componentInstance.color).toBe('accent');
    });
  });

  describe('Edge Cases', () => {
    it('should handle participante with 0 cost', () => {
      const zeroCost = { ...mockParticipantePagado, costoPorPersona: 0 };
      component.participante = zeroCost;

      expect(component.porcentajePagado).toBe(0);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle participante with negative saldo', () => {
      const negativeSaldo = { ...mockParticipantePagado, saldoPendiente: -100 };
      component.participante = negativeSaldo;

      expect(component.montoAdeudado).toBe(-100);
      expect(component.estadoPago).toBe('completo'); // Because montoAdeudado <= 0
    });

    it('should handle participante with overpayment', () => {
      const overpaid: PagoParticipante = {
        participanteId: 'part-4',
        participanteNombre: 'Test',
        costoPorPersona: 1000,
        totalPagado: 1500,
        saldoPendiente: -500,
        pagos: []
      };
      component.participante = overpaid;

      expect(component.porcentajePagado).toBe(150);
      expect(component.estadoPago).toBe('completo');
    });
  });
});
