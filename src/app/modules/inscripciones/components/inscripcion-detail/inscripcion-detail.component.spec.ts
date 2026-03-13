/**
 * InscripcionDetailComponent Tests
 *
 * Tests the detail view for inscriptions including:
 * - Computed signals (progress, authorization status, etc.)
 * - Navigation actions (edit, delete, back)
 * - Payment dialog operations (register, edit, delete payments)
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InscripcionDetailComponent } from './inscripcion-detail.component';
import { InscripcionesStateService } from '../../services/inscripciones-state.service';
import { CajasApiService } from '../../../cajas/services/cajas-api.service';
import { ConfirmDialogService } from '../../../../shared/services';
import { InscripcionConEstado, PagoInscripcionDto, UpdatePagoDto } from '../../../../shared/models';
import {
  createMockInscripcionConEstado,
  createPendienteScenario,
  createParcialScenario,
  createPagadoSinCajaPersonalScenario,
  createBonificadoTotalScenario,
  createMockInscripcionesStateServiceVitest,
  createMockCajasApiServiceVitest,
  MockInscripcionesStateService,
  MockCajasApiService,
} from '../../testing/inscripciones-test-utils';
import type { PagoInscripcionDialogResult } from '../shared/pago-inscripcion-dialog/pago-inscripcion-dialog.component';

describe('InscripcionDetailComponent', () => {
  let component: InscripcionDetailComponent;
  let fixture: ComponentFixture<InscripcionDetailComponent>;
  let mockState: MockInscripcionesStateService;
  let mockCajasApi: MockCajasApiService;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { params: Subject<{ id: string }> };
  let mockConfirmDialog: { confirmDelete: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockState = createMockInscripcionesStateServiceVitest(vi);
    mockCajasApi = createMockCajasApiServiceVitest(vi, 5000);
    mockRouter = { navigate: vi.fn().mockReturnValue(Promise.resolve(true)) };
    mockActivatedRoute = { params: new Subject<{ id: string }>() };
    mockConfirmDialog = { confirmDelete: vi.fn().mockReturnValue(of(true)) };
    mockDialog = { open: vi.fn() };

    TestBed.configureTestingModule({
      imports: [InscripcionDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: InscripcionesStateService, useValue: mockState },
        { provide: CajasApiService, useValue: mockCajasApi },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    fixture = TestBed.createComponent(InscripcionDetailComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose state signals', () => {
      expect(component.loading).toBeDefined();
      expect(component.error).toBeDefined();
      expect(component.detail).toBeDefined();
    });

    it('should expose label mappings', () => {
      expect(component.tipoLabels).toBeDefined();
      expect(component.estadoLabels).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call state.select with route param id', () => {
      fixture.detectChanges();
      mockActivatedRoute.params.next({ id: 'insc-123' });

      expect(mockState.select).toHaveBeenCalledWith('insc-123');
    });

    it('should not call state.select if no id in route params', () => {
      fixture.detectChanges();
      mockActivatedRoute.params.next({} as { id: string });

      expect(mockState.select).not.toHaveBeenCalled();
    });
  });

  describe('Computed Signals', () => {
    describe('showAuthorizations', () => {
      it('should return true for scout_argentina type', () => {
        const detail = createMockInscripcionConEstado({ tipo: 'scout_argentina' });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.showAuthorizations()).toBe(true);
      });

      it('should return false for grupo type', () => {
        const detail = createMockInscripcionConEstado({ tipo: 'grupo' });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.showAuthorizations()).toBe(false);
      });

      it('should return false when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.showAuthorizations()).toBe(false);
      });
    });

    describe('montoAPagar', () => {
      it('should calculate montoTotal - montoBonificado', () => {
        const detail = createMockInscripcionConEstado({
          montoTotal: 15000,
          montoBonificado: 3000,
        });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.montoAPagar()).toBe(12000);
      });

      it('should return full montoTotal when no bonificacion', () => {
        const detail = createPendienteScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.montoAPagar()).toBe(15000);
      });

      it('should return 0 when fully bonificado', () => {
        const detail = createBonificadoTotalScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.montoAPagar()).toBe(0);
      });

      it('should return 0 when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.montoAPagar()).toBe(0);
      });
    });

    describe('progressPercent', () => {
      it('should calculate correct percentage for partial payment', () => {
        const detail = createParcialScenario(10000, 5000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressPercent()).toBe(50);
      });

      it('should return 100 for fully paid', () => {
        const detail = createPagadoSinCajaPersonalScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressPercent()).toBe(100);
      });

      it('should return 0 for pending', () => {
        const detail = createPendienteScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressPercent()).toBe(0);
      });

      it('should return 100 for fully bonificado (montoAPagar = 0)', () => {
        const detail = createBonificadoTotalScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressPercent()).toBe(100);
      });

      it('should cap at 100 even if overpaid', () => {
        const detail = createMockInscripcionConEstado(
          { montoTotal: 10000, montoBonificado: 0 },
          12000, // overpaid
          'pagado',
        );
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressPercent()).toBe(100);
      });

      it('should return 0 when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.progressPercent()).toBe(0);
      });
    });

    describe('progressClass', () => {
      it('should return success class when fully paid', () => {
        const detail = createPagadoSinCajaPersonalScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressClass()).toBe('payment-progress__fill--success');
      });

      it('should return partial class when partially paid', () => {
        const detail = createParcialScenario(15000, 5000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressClass()).toBe('payment-progress__fill--partial');
      });

      it('should return pending class when no payment', () => {
        const detail = createPendienteScenario(15000);
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.progressClass()).toBe('payment-progress__fill--pending');
      });

      it('should return pending class when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.progressClass()).toBe('payment-progress__fill--pending');
      });
    });

    describe('estadoIcon', () => {
      it('should return check_circle for pagado', () => {
        const detail = createPagadoSinCajaPersonalScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.estadoIcon()).toBe('check_circle');
      });

      it('should return timelapse for parcial', () => {
        const detail = createParcialScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.estadoIcon()).toBe('timelapse');
      });

      it('should return card_giftcard for bonificado', () => {
        const detail = createBonificadoTotalScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.estadoIcon()).toBe('card_giftcard');
      });

      it('should return schedule for pendiente', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.estadoIcon()).toBe('schedule');
      });

      it('should return schedule when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.estadoIcon()).toBe('schedule');
      });
    });

    describe('authComplete', () => {
      it('should return true when all authorizations are true', () => {
        const detail = createMockInscripcionConEstado({
          declaracionDeSalud: true,
          autorizacionDeImagen: true,
          salidasCercanas: true,
          autorizacionIngreso: true,
        });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.authComplete()).toBe(true);
      });

      it('should return false when any authorization is false', () => {
        const detail = createMockInscripcionConEstado({
          declaracionDeSalud: true,
          autorizacionDeImagen: true,
          salidasCercanas: false,
          autorizacionIngreso: true,
        });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.authComplete()).toBe(false);
      });

      it('should return false when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.authComplete()).toBe(false);
      });
    });

    describe('authPendingCount', () => {
      it('should return 0 when all authorizations complete', () => {
        const detail = createMockInscripcionConEstado({
          declaracionDeSalud: true,
          autorizacionDeImagen: true,
          salidasCercanas: true,
          autorizacionIngreso: true,
        });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.authPendingCount()).toBe(0);
      });

      it('should return 2 when two authorizations missing', () => {
        const detail = createMockInscripcionConEstado({
          declaracionDeSalud: true,
          autorizacionDeImagen: false,
          salidasCercanas: true,
          autorizacionIngreso: false,
        });
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.authPendingCount()).toBe(2);
      });

      it('should return 4 when all authorizations missing', () => {
        const detail = createPendienteScenario(); // All auth fields default false
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        expect(component.authPendingCount()).toBe(4);
      });

      it('should return 4 when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        expect(component.authPendingCount()).toBe(4);
      });
    });
  });

  describe('medioPagoLabel', () => {
    it('should return Efectivo for efectivo', () => {
      expect(component.medioPagoLabel('efectivo')).toBe('Efectivo');
    });

    it('should return Transferencia for transferencia', () => {
      expect(component.medioPagoLabel('transferencia')).toBe('Transferencia');
    });

    it('should return Saldo Personal for saldo_personal', () => {
      expect(component.medioPagoLabel('saldo_personal')).toBe('Saldo Personal');
    });

    it('should return input value for unknown medio', () => {
      expect(component.medioPagoLabel('bitcoin')).toBe('bitcoin');
    });
  });

  describe('Navigation Actions', () => {
    describe('onEdit', () => {
      it('should navigate to edit route', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        component.onEdit();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones', detail.id, 'editar']);
      });

      it('should not navigate when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        component.onEdit();

        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });

    describe('onBack', () => {
      it('should navigate to inscripciones list', () => {
        component.onBack();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
      });
    });

    describe('onDelete', () => {
      it('should show confirm dialog and delete on confirmation', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        component.onDelete();

        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('inscripción');
        expect(mockState.delete).toHaveBeenCalledWith(detail.id);
      });

      it('should navigate to list after successful delete', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        component.onDelete();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/inscripciones']);
      });

      it('should not delete when dialog cancelled', () => {
        mockConfirmDialog.confirmDelete.mockReturnValue(of(false));
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        component.onDelete();

        expect(mockState.delete).not.toHaveBeenCalled();
      });

      it('should not delete when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        component.onDelete();

        expect(mockConfirmDialog.confirmDelete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Payment Dialog Operations', () => {
    let mockDialogRef: { afterClosed: ReturnType<typeof vi.fn> };
    let openPaymentDialogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      mockDialogRef = { afterClosed: vi.fn() };
      mockDialog.open.mockReturnValue(mockDialogRef);

      // Spy on the private openPaymentDialog method to bypass the async dynamic import
      // This makes the method return a synchronous Observable instead of from(import())
      openPaymentDialogSpy = vi
        .spyOn(component as unknown as { openPaymentDialog: () => unknown }, 'openPaymentDialog')
        .mockReturnValue(of(mockDialogRef));
    });

    describe('onRegisterPayment', () => {
      it('should not open dialog when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        component.onRegisterPayment();

        expect(mockCajasApi.getSaldoCuentaPersonal).not.toHaveBeenCalled();
      });

      it('should not open dialog when saldoPendiente is 0', () => {
        const detail = createPagadoSinCajaPersonalScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        fixture.detectChanges();

        component.onRegisterPayment();

        expect(mockCajasApi.getSaldoCuentaPersonal).not.toHaveBeenCalled();
      });

      it('should fetch saldo cuenta personal before opening dialog', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        mockDialogRef.afterClosed.mockReturnValue(of(undefined));
        fixture.detectChanges();

        component.onRegisterPayment();

        expect(mockCajasApi.getSaldoCuentaPersonal).toHaveBeenCalledWith(detail.personaId);
      });

      it('should call pagarInscripcion on create result', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        const createResult: PagoInscripcionDialogResult = {
          mode: 'create',
          data: {
            montoPagado: 5000,
            montoConSaldoPersonal: 0,
            medioPago: 'efectivo',
            descripcion: undefined,
          },
        };
        mockDialogRef.afterClosed.mockReturnValue(of(createResult));
        fixture.detectChanges();

        component.onRegisterPayment();

        const expectedDto: PagoInscripcionDto = {
          montoPagado: 5000,
          montoConSaldoPersonal: 0,
          medioPago: 'efectivo',
          descripcion: undefined,
        };
        expect(mockState.pagarInscripcion).toHaveBeenCalledWith(detail.id, expectedDto);
      });

      it('should not call pagarInscripcion when dialog cancelled', () => {
        const detail = createPendienteScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        mockDialogRef.afterClosed.mockReturnValue(of(undefined));
        fixture.detectChanges();

        component.onRegisterPayment();

        expect(mockState.pagarInscripcion).not.toHaveBeenCalled();
      });
    });

    describe('onEditPayment', () => {
      const mockMov = {
        id: 'mov-123',
        monto: 5000,
        medioPago: 'efectivo' as const,
        descripcion: 'Test payment',
        fecha: '2026-01-15T10:00:00Z',
      };

      it('should not open dialog when no detail', () => {
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(null);
        fixture.detectChanges();

        component.onEditPayment(mockMov);

        expect(mockDialog.open).not.toHaveBeenCalled();
      });

      it('should call updatePago on edit result', () => {
        const detail = createParcialScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        const editResult: PagoInscripcionDialogResult = {
          mode: 'edit',
          movimientoId: mockMov.id,
          data: {
            monto: 6000,
            medioPago: 'transferencia',
            descripcion: 'Updated',
          },
        };
        mockDialogRef.afterClosed.mockReturnValue(of(editResult));
        fixture.detectChanges();

        component.onEditPayment(mockMov);

        const expectedDto: UpdatePagoDto = {
          monto: 6000,
          medioPago: 'transferencia',
          descripcion: 'Updated',
        };
        expect(mockState.updatePago).toHaveBeenCalledWith(detail.id, mockMov.id, expectedDto);
      });

      it('should call deletePago on delete result', () => {
        const detail = createParcialScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        const deleteResult: PagoInscripcionDialogResult = {
          mode: 'delete',
          movimientoId: mockMov.id,
        };
        mockDialogRef.afterClosed.mockReturnValue(of(deleteResult));
        fixture.detectChanges();

        component.onEditPayment(mockMov);

        expect(mockState.deletePago).toHaveBeenCalledWith(detail.id, mockMov.id);
      });

      it('should not call any action when dialog cancelled', () => {
        const detail = createParcialScenario();
        (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
        mockDialogRef.afterClosed.mockReturnValue(of(undefined));
        fixture.detectChanges();

        component.onEditPayment(mockMov);

        expect(mockState.updatePago).not.toHaveBeenCalled();
        expect(mockState.deletePago).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero montoTotal gracefully', () => {
      const detail = createMockInscripcionConEstado(
        { montoTotal: 0, montoBonificado: 0 },
        0,
        'pendiente',
      );
      (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
      fixture.detectChanges();

      expect(component.montoAPagar()).toBe(0);
      expect(component.progressPercent()).toBe(100); // Division by zero protection
    });

    it('should handle inscripcion with all authorizations false', () => {
      const detail = createPendienteScenario();
      (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
      fixture.detectChanges();

      expect(component.authComplete()).toBe(false);
      expect(component.authPendingCount()).toBe(4);
    });

    it('should handle inscripcion with partial authorizations', () => {
      const detail = createMockInscripcionConEstado({
        declaracionDeSalud: true,
        autorizacionDeImagen: false,
        salidasCercanas: true,
        autorizacionIngreso: false,
      });
      (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
      fixture.detectChanges();

      expect(component.authComplete()).toBe(false);
      expect(component.authPendingCount()).toBe(2);
    });

    it('should show authorizations section for scout_argentina type', () => {
      const detail = createMockInscripcionConEstado({ tipo: 'scout_argentina' });
      (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
      fixture.detectChanges();

      expect(component.showAuthorizations()).toBe(true);
    });

    it('should hide authorizations section for grupo type', () => {
      const detail = createMockInscripcionConEstado({ tipo: 'grupo' });
      (mockState.selectedDetail as WritableSignal<InscripcionConEstado | null>).set(detail);
      fixture.detectChanges();

      expect(component.showAuthorizations()).toBe(false);
    });
  });
});
