/**
 * CerrarEventoDialogComponent Tests
 * Jasmine + Karma — TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { CerrarEventoDialogComponent } from './cerrar-evento-dialog.component';
import { EventoKpis } from '../../../../../shared/models';
import { MedioPagoEnum } from '../../../../../shared/enums';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeKpis(overrides: Partial<EventoKpis> = {}): EventoKpis {
  return {
    totalIngresos: 5000,
    totalGastado: 1000,
    totalPendienteReembolso: 200,
    balance: 4000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CerrarEventoDialogComponent', () => {
  let component: CerrarEventoDialogComponent;
  let fixture: ComponentFixture<CerrarEventoDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CerrarEventoDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CerrarEventoDialogComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { eventoId: 'evt-1', nombreEvento: 'Bazar', kpis: makeKpis() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CerrarEventoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('Component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose kpis from dialog data', () => {
      expect(component.data.kpis?.totalIngresos).toBe(5000);
    });

    it('should expose medioPago options', () => {
      expect(component.medioPagoOptions.length).toBeGreaterThan(0);
    });
  });

  // ─── Form ─────────────────────────────────────────────────────────────────

  describe('form validation', () => {
    it('should have invalid form when medioPago is empty', () => {
      component.form.get('medioPago')?.setValue('');
      expect(component.form.invalid).toBeTrue();
    });

    it('should have valid form when medioPago is set', () => {
      component.form.get('medioPago')?.setValue(MedioPagoEnum.EFECTIVO);
      expect(component.form.valid).toBeTrue();
    });
  });

  // ─── Confirmation ─────────────────────────────────────────────────────────

  describe('onConfirm', () => {
    it('should not close if form is invalid', () => {
      component.form.get('medioPago')?.setValue('');
      component.onConfirm();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close with dto when form is valid', () => {
      component.form.get('medioPago')?.setValue(MedioPagoEnum.EFECTIVO);
      component.onConfirm();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        dto: { medioPago: MedioPagoEnum.EFECTIVO },
      });
    });
  });

  // ─── Cancellation ─────────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('should close dialog without result', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
    });
  });
});
