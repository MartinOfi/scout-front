/**
 * FondoSolidarioComponent Tests
 * TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FondoSolidarioComponent } from './fondo-solidario.component';
import { CajasStateService } from '../../services/cajas-state.service';
import {
  createMockCajasStateService,
  createMockMovimiento,
  MockCajasStateService,
} from '../../testing/cajas-test-utils';
import { MovimientosApiService } from '../../../movimientos/services/movimientos-api.service';
import { ConfirmDialogService } from '../../../../shared/services';
import { ConceptoMovimiento } from '../../../../shared/enums';

describe('FondoSolidarioComponent', () => {
  let component: FondoSolidarioComponent;
  let fixture: ComponentFixture<FondoSolidarioComponent>;
  let mockStateService: MockCajasStateService;
  let mockMovimientosApi: { delete: ReturnType<typeof vi.fn> };
  let mockConfirmDialog: { delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockStateService = createMockCajasStateService();
    mockMovimientosApi = { delete: vi.fn(() => of(undefined)) };
    mockConfirmDialog = { delete: vi.fn(() => of({ confirmed: true })) };

    await TestBed.configureTestingModule({
      imports: [FondoSolidarioComponent],
      providers: [
        { provide: CajasStateService, useValue: mockStateService },
        { provide: MovimientosApiService, useValue: mockMovimientosApi },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FondoSolidarioComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadConsolidado on ngOnInit', () => {
    component.ngOnInit();
    expect(mockStateService.loadConsolidado).toHaveBeenCalledTimes(1);
  });

  it('should call loadTransferenciasFondoSolidario on ngOnInit', () => {
    component.ngOnInit();
    expect(mockStateService.loadTransferenciasFondoSolidario).toHaveBeenCalledTimes(1);
  });

  it('muestra el saldo disponible y el total bonificado', () => {
    mockStateService.saldoFondoSolidario.set(500000);
    mockStateService.bonificacionesOtorgadas.set(80000);
    mockStateService.cajaFondoSolidarioId.set('fondo-id');
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('500.000');
    expect(text).toContain('80.000');
  });

  it('muestra la acción de crear el fondo cuando todavía no existe', () => {
    mockStateService.cajaFondoSolidarioId.set(null);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Crear Fondo Solidario');
  });

  it('muestra la acción de transferir cuando el fondo ya existe', () => {
    mockStateService.cajaFondoSolidarioId.set('fondo-id');
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Transferir');
  });

  describe('listado de transferencias', () => {
    it('muestra las transferencias entrantes al fondo solidario', () => {
      mockStateService.cajaFondoSolidarioId.set('fondo-id');
      mockStateService.transferenciasFondoSolidario.set([
        createMockMovimiento({
          id: 'mov-1',
          concepto: ConceptoMovimiento.TRANSFERENCIA_ENTRE_CAJAS,
          descripcion: 'Asignacion mensual',
        }),
      ]);
      fixture.detectChanges();

      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Asignacion mensual');
    });

    it('elimina una transferencia cuando se confirma el borrado', () => {
      mockMovimientosApi.delete.mockReturnValue(of(undefined));

      component.onEliminarTransferencia('mov-1');

      expect(mockConfirmDialog.delete).toHaveBeenCalledWith(
        'transferencia',
        expect.any(Function),
        expect.anything(),
      );
      expect(mockStateService.loadTransferenciasFondoSolidario).toHaveBeenCalled();
      expect(mockStateService.loadConsolidado).toHaveBeenCalled();
    });

    it('no recarga nada cuando el usuario cancela el borrado', () => {
      mockConfirmDialog.delete.mockReturnValue(of({ confirmed: false }));
      mockStateService.loadTransferenciasFondoSolidario.mockClear();
      mockStateService.loadConsolidado.mockClear();

      component.onEliminarTransferencia('mov-1');

      expect(mockStateService.loadTransferenciasFondoSolidario).not.toHaveBeenCalled();
      expect(mockStateService.loadConsolidado).not.toHaveBeenCalled();
    });
  });
});
