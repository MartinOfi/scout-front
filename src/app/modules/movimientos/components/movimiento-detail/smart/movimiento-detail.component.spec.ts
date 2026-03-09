import { vi } from 'vitest';
/**
 * MovimientoDetailComponent - Unit Tests
 * Smart component - state management and routing
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovimientoDetailComponent } from './movimiento-detail.component';
import { MovimientosStateService } from '../../../services/movimientos-state.service';
import { ConfirmDialogService } from '../../../../../shared/services';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Movimiento } from '../../../../../shared/models';
import { TipoMovimientoEnum, ConceptoMovimiento, MedioPagoEnum, EstadoPago } from '../../../../../shared/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MovimientoDetailComponent', () => {
  let component: MovimientoDetailComponent;
  let fixture: ComponentFixture<MovimientoDetailComponent>;
  let mockStateService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockConfirmDialog: any;

  const mockMovimiento: Movimiento = {
    id: 'mov-123',
    cajaId: 'caja-1',
    tipo: TipoMovimientoEnum.INGRESO,
    monto: 1500,
    concepto: ConceptoMovimiento.CUOTA_GRUPO,
    descripcion: 'Test movimiento',
    responsableId: 'resp-1',
    medioPago: MedioPagoEnum.TRANSFERENCIA,
    requiereComprobante: false,
    estadoPago: EstadoPago.PAGADO,
    fecha: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    // Mock StateService with mutable signals
    mockStateService = {
      selected: vi.fn().mockReturnValue(mockMovimiento),
      loading: signal(false),
      error: signal(null),
      select: vi.fn(),
      load: vi.fn().mockReturnValue(of(undefined)),
      delete: vi.fn().mockReturnValue(of(undefined))
    };

    // Mock Router
    mockRouter = {
      navigate: vi.fn()
    };

    // Mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('mov-123')
        }
      }
    };

    // Mock ConfirmDialogService
    mockConfirmDialog = {
      confirmDelete: vi.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [MovimientoDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: MovimientosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientoDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load movimiento on init when id is present', () => {
      fixture.detectChanges(); // triggers ngOnInit

      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(mockStateService.select).toHaveBeenCalledWith('mov-123');
    });

    it('should navigate to /movimientos when no id is present', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos']);
    });

    it('should set movimiento signal when found', () => {
      fixture.detectChanges();

      expect(component.movimiento()).toEqual(mockMovimiento);
    });

    it('should load all movimientos when not found in current list', () => {
      mockStateService.selected.mockReturnValue(null);

      fixture.detectChanges();

      expect(mockStateService.load).toHaveBeenCalled();
    });
  });

  describe('onEdit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to edit route with correct id', () => {
      component.onEdit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos', 'mov-123', 'editar']);
    });

    it('should NOT navigate when movimiento is null', () => {
      component.movimiento.set(null);

      component.onEdit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    beforeEach(() => {
      fixture.detectChanges();
      mockStateService.delete.mockReturnValue(of(undefined));
    });

    it('should show confirmation dialog', () => {
      component.onDelete();

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('movimiento');
    });

    it('should delete movimiento when confirmed', async () => {
      component.onDelete();

      await vi.waitFor(() => {
        expect(mockStateService.delete).toHaveBeenCalledWith('mov-123');
      });
    });

    it('should navigate to /movimientos after successful delete', async () => {
      component.onDelete();

      await vi.waitFor(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos']);
      });
    });

    it('should NOT delete when confirmation is cancelled', async () => {
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete();

      await vi.waitFor(() => {
        expect(mockStateService.delete).not.toHaveBeenCalled();
      });
    });

    it('should NOT crash when movimiento is null', () => {
      component.movimiento.set(null);

      expect(() => component.onDelete()).not.toThrow();
      expect(mockConfirmDialog.confirmDelete).not.toHaveBeenCalled();
    });

    it('should handle delete errors gracefully', async () => {
      mockStateService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      component.onDelete();

      await vi.waitFor(() => {
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('onBack', () => {
    it('should navigate to /movimientos', () => {
      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos']);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display loading spinner when loading', () => {
      mockStateService.loading.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display error message when error exists', () => {
      mockStateService.loading.set(false);
      mockStateService.error.set('Error loading movimiento');
      component.movimiento.set(null);
      fixture.detectChanges();

      const errorContainer = fixture.nativeElement.querySelector('.error-container');
      expect(errorContainer).toBeTruthy();
      expect(errorContainer.textContent).toContain('Error loading movimiento');
    });

    it('should display movimiento info card when loaded', () => {
      const infoCard = fixture.nativeElement.querySelector('app-movimiento-info-card');
      expect(infoCard).toBeTruthy();
    });

    it('should NOT display info card when loading', () => {
      mockStateService.loading.set(true);
      component.movimiento.set(null);
      fixture.detectChanges();

      const infoCard = fixture.nativeElement.querySelector('app-movimiento-info-card');
      expect(infoCard).toBeFalsy();
    });

    it('should display header with title', () => {
      const header = fixture.nativeElement.querySelector('h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('Detalle del Movimiento');
    });

    it('should display back button', () => {
      const backButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
      expect(backButton).toBeTruthy();
    });

    it('should display edit button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.actions button');
      const editButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Editar')
      );
      expect(editButton).toBeTruthy();
    });

    it('should display delete button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.actions button');
      const deleteButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Eliminar')
      );
      expect(deleteButton).toBeTruthy();
    });

    it('should disable edit button when no movimiento', () => {
      component.movimiento.set(null);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.actions button');
      const editButton: HTMLButtonElement = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Editar')
      ) as HTMLButtonElement;

      expect(editButton.disabled).toBe(true);
    });

    it('should disable delete button when no movimiento', () => {
      component.movimiento.set(null);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.actions button');
      const deleteButton: HTMLButtonElement = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Eliminar')
      ) as HTMLButtonElement;

      expect(deleteButton.disabled).toBe(true);
    });
  });

  describe('Integration with State Service', () => {
    it('should use readonly signals from state service', () => {
      expect(component.loading).toBe(mockStateService.loading);
      expect(component.error).toBe(mockStateService.error);
    });

    it('should call state.select with correct id', () => {
      fixture.detectChanges();

      expect(mockStateService.select).toHaveBeenCalledWith('mov-123');
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent delete calls', async () => {
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();
      component.onDelete();

      await vi.waitFor(() => {
        // Should only call delete once (first call completes before second starts)
        expect(mockStateService.delete).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle route param changes', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('different-id');

      const newComponent = TestBed.createComponent(MovimientoDetailComponent).componentInstance;
      (newComponent as any).ngOnInit();

      expect(mockStateService.select).toHaveBeenCalledWith('different-id');
    });
  });
});
