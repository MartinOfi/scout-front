/**
 * InscripcionesApiService Tests
 * Tests HTTP communication layer for inscripciones module
 * Coverage target: 90%+
 */

import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';

import { InscripcionesApiService, InscripcionesQueryParams } from './inscripciones-api.service';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import {
  CreateInscripcionDto,
  UpdateInscripcionDto,
  PagoInscripcionDto,
  UpdatePagoDto,
} from '../../../shared/models';
import {
  createMockInscripcion,
  createPendienteScenario,
  createParcialScenario,
  createPagadoSinCajaPersonalScenario,
  createPagadoConCajaPersonalScenario,
} from '../testing/inscripciones-test-utils';

// ==========================================================================
// MOCK INTERFACES
// ==========================================================================

interface MockHttpService {
  get: Mock;
  post: Mock;
  patch: Mock;
  delete: Mock;
}

// ==========================================================================
// TEST SUITE
// ==========================================================================

describe('InscripcionesApiService', () => {
  let service: InscripcionesApiService;
  let mockHttpService: MockHttpService;

  const INSCRIPCIONES_ENDPOINT = API_CONFIG.ENDPOINTS.INSCRIPCIONES;
  const MOVIMIENTOS_ENDPOINT = API_CONFIG.ENDPOINTS.MOVIMIENTOS;

  beforeEach(() => {
    mockHttpService = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        InscripcionesApiService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    });

    service = TestBed.inject(InscripcionesApiService);
  });

  // ==========================================================================
  // BASIC TESTS
  // ==========================================================================

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  // ==========================================================================
  // GET ALL
  // ==========================================================================

  describe('getAll()', () => {
    it('should call http.get with inscripciones endpoint', () => {
      const mockInscripciones = [createMockInscripcion()];
      mockHttpService.get.mockReturnValue(of(mockInscripciones));

      service.getAll().subscribe();

      expect(mockHttpService.get).toHaveBeenCalledWith(INSCRIPCIONES_ENDPOINT, {});
    });

    it('should pass ano query param when provided', () => {
      mockHttpService.get.mockReturnValue(of([]));
      const params: InscripcionesQueryParams = { ano: 2026 };

      service.getAll(params).subscribe();

      expect(mockHttpService.get).toHaveBeenCalledWith(INSCRIPCIONES_ENDPOINT, { ano: '2026' });
    });

    it('should pass tipo query param when provided', () => {
      mockHttpService.get.mockReturnValue(of([]));
      const params: InscripcionesQueryParams = { tipo: 'scout_argentina' };

      service.getAll(params).subscribe();

      expect(mockHttpService.get).toHaveBeenCalledWith(INSCRIPCIONES_ENDPOINT, {
        tipo: 'scout_argentina',
      });
    });

    it('should pass both ano and tipo query params', () => {
      mockHttpService.get.mockReturnValue(of([]));
      const params: InscripcionesQueryParams = { ano: 2026, tipo: 'grupo' };

      service.getAll(params).subscribe();

      expect(mockHttpService.get).toHaveBeenCalledWith(INSCRIPCIONES_ENDPOINT, {
        ano: '2026',
        tipo: 'grupo',
      });
    });

    it('should return inscripciones array', async () => {
      const mockInscripciones = [
        createMockInscripcion({ id: '1' }),
        createMockInscripcion({ id: '2' }),
      ];
      mockHttpService.get.mockReturnValue(of(mockInscripciones));

      const result = await firstValueFrom(service.getAll());

      expect(result).toEqual(mockInscripciones);
      expect(result.length).toBe(2);
    });

    it('should propagate errors', async () => {
      const error = new Error('Network error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.getAll())).rejects.toThrow('Network error');
    });
  });

  // ==========================================================================
  // GET BY ID
  // ==========================================================================

  describe('getById()', () => {
    it('should call http.get with inscripcion id', () => {
      const mockInscripcion = createPendienteScenario();
      mockHttpService.get.mockReturnValue(of(mockInscripcion));

      service.getById('ins-123').subscribe();

      expect(mockHttpService.get).toHaveBeenCalledWith(`${INSCRIPCIONES_ENDPOINT}/ins-123`);
    });

    it('should return InscripcionConEstado with pendiente estado', async () => {
      const mockInscripcion = createPendienteScenario();
      mockHttpService.get.mockReturnValue(of(mockInscripcion));

      const result = await firstValueFrom(service.getById('ins-123'));

      expect(result).toEqual(mockInscripcion);
      expect(result.estado).toBe('pendiente');
    });

    it('should return inscripcion with parcial estado', async () => {
      const mockInscripcion = createParcialScenario();
      mockHttpService.get.mockReturnValue(of(mockInscripcion));

      const result = await firstValueFrom(service.getById('ins-123'));

      expect(result.estado).toBe('parcial');
      expect(result.movimientos.length).toBeGreaterThan(0);
    });

    it('should return inscripcion with pagado estado', async () => {
      const mockInscripcion = createPagadoSinCajaPersonalScenario();
      mockHttpService.get.mockReturnValue(of(mockInscripcion));

      const result = await firstValueFrom(service.getById('ins-123'));

      expect(result.estado).toBe('pagado');
    });

    it('should propagate errors', async () => {
      const error = new Error('Not found');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.getById('invalid-id'))).rejects.toThrow('Not found');
    });
  });

  // ==========================================================================
  // GET BY PERSONA
  // ==========================================================================

  describe('getByPersona()', () => {
    it('should call http.get with persona endpoint', () => {
      mockHttpService.get.mockReturnValue(of([]));

      service.getByPersona('persona-123').subscribe();

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${INSCRIPCIONES_ENDPOINT}/persona/persona-123`,
      );
    });

    it('should return inscripciones array for persona', async () => {
      const mockInscripciones = [createMockInscripcion({ personaId: 'persona-123' })];
      mockHttpService.get.mockReturnValue(of(mockInscripciones));

      const result = await firstValueFrom(service.getByPersona('persona-123'));

      expect(result).toEqual(mockInscripciones);
    });

    it('should return empty array when persona has no inscripciones', async () => {
      mockHttpService.get.mockReturnValue(of([]));

      const result = await firstValueFrom(service.getByPersona('persona-no-inscripciones'));

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // CREATE
  // ==========================================================================

  describe('create()', () => {
    const createDto: CreateInscripcionDto = {
      personaId: 'persona-123',
      ano: 2026,
      tipo: 'scout_argentina',
      montoTotal: 50000,
      montoBonificado: 0,
    };

    it('should call http.post with endpoint and dto', () => {
      const mockInscripcion = createMockInscripcion();
      mockHttpService.post.mockReturnValue(of(mockInscripcion));

      service.create(createDto).subscribe();

      expect(mockHttpService.post).toHaveBeenCalledWith(INSCRIPCIONES_ENDPOINT, createDto);
    });

    it('should return created inscripcion', async () => {
      const mockInscripcion = createMockInscripcion({
        personaId: createDto.personaId,
        ano: createDto.ano,
        tipo: createDto.tipo,
        montoTotal: createDto.montoTotal,
      });
      mockHttpService.post.mockReturnValue(of(mockInscripcion));

      const result = await firstValueFrom(service.create(createDto));

      expect(result.personaId).toBe(createDto.personaId);
      expect(result.ano).toBe(createDto.ano);
      expect(result.tipo).toBe(createDto.tipo);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation error: personaId required');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.create({} as CreateInscripcionDto))).rejects.toThrow(
        'Validation',
      );
    });
  });

  // ==========================================================================
  // UPDATE
  // ==========================================================================

  describe('update()', () => {
    const updateDto: UpdateInscripcionDto = {
      montoBonificado: 10000,
      declaracionDeSalud: true,
    };

    it('should call http.patch with id and dto', () => {
      const mockInscripcion = createMockInscripcion({ montoBonificado: 10000 });
      mockHttpService.patch.mockReturnValue(of(mockInscripcion));

      service.update('ins-123', updateDto).subscribe();

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `${INSCRIPCIONES_ENDPOINT}/ins-123`,
        updateDto,
      );
    });

    it('should return updated inscripcion', async () => {
      const mockInscripcion = createMockInscripcion({
        montoBonificado: updateDto.montoBonificado,
        declaracionDeSalud: updateDto.declaracionDeSalud,
      });
      mockHttpService.patch.mockReturnValue(of(mockInscripcion));

      const result = await firstValueFrom(service.update('ins-123', updateDto));

      expect(result.montoBonificado).toBe(updateDto.montoBonificado);
      expect(result.declaracionDeSalud).toBe(updateDto.declaracionDeSalud);
    });

    it('should handle not found errors', async () => {
      const error = new Error('Inscripcion not found');
      mockHttpService.patch.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.update('invalid-id', updateDto))).rejects.toThrow(
        'not found',
      );
    });
  });

  // ==========================================================================
  // DELETE
  // ==========================================================================

  describe('delete()', () => {
    it('should call http.delete with inscripcion id', () => {
      mockHttpService.delete.mockReturnValue(of(undefined));

      service.delete('ins-123').subscribe();

      expect(mockHttpService.delete).toHaveBeenCalledWith(`${INSCRIPCIONES_ENDPOINT}/ins-123`);
    });

    it('should complete successfully on delete', async () => {
      mockHttpService.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.delete('ins-123'));

      expect(result).toBeUndefined();
      expect(mockHttpService.delete).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Cannot delete: has payments');
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.delete('ins-with-payments'))).rejects.toThrow(
        'Cannot delete',
      );
    });
  });

  // ==========================================================================
  // PAGAR INSCRIPCION
  // ==========================================================================

  describe('pagarInscripcion()', () => {
    const pagoDto: PagoInscripcionDto = {
      montoPagado: 25000,
      medioPago: 'efectivo',
      montoConSaldoPersonal: 0,
    };

    it('should call http.post with pagar endpoint', () => {
      const mockResult = createParcialScenario();
      mockHttpService.post.mockReturnValue(of(mockResult));

      service.pagarInscripcion('ins-123', pagoDto).subscribe();

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `${INSCRIPCIONES_ENDPOINT}/ins-123/pagar`,
        pagoDto,
      );
    });

    it('should return updated InscripcionConEstado with parcial estado', async () => {
      const mockResult = createParcialScenario();
      mockHttpService.post.mockReturnValue(of(mockResult));

      const result = await firstValueFrom(service.pagarInscripcion('ins-123', pagoDto));

      expect(result.estado).toBe('parcial');
      expect(result.movimientos.length).toBeGreaterThan(0);
    });

    it('should handle payment with saldo personal', async () => {
      const pagoConSaldo: PagoInscripcionDto = {
        montoPagado: 15000,
        medioPago: 'saldo_personal',
        montoConSaldoPersonal: 10000,
      };
      const mockResult = createPagadoConCajaPersonalScenario();
      mockHttpService.post.mockReturnValue(of(mockResult));

      const result = await firstValueFrom(service.pagarInscripcion('ins-123', pagoConSaldo));

      expect(result.estado).toBe('pagado');
    });

    it('should handle transferencia payment method', () => {
      const pagoTransferencia: PagoInscripcionDto = {
        montoPagado: 50000,
        medioPago: 'transferencia',
        montoConSaldoPersonal: 0,
      };
      const mockResult = createPagadoSinCajaPersonalScenario();
      mockHttpService.post.mockReturnValue(of(mockResult));

      service.pagarInscripcion('ins-123', pagoTransferencia).subscribe();

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `${INSCRIPCIONES_ENDPOINT}/ins-123/pagar`,
        pagoTransferencia,
      );
    });

    it('should propagate payment errors', async () => {
      const error = new Error('Insufficient funds');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(firstValueFrom(service.pagarInscripcion('ins-123', pagoDto))).rejects.toThrow(
        'Insufficient',
      );
    });
  });

  // ==========================================================================
  // UPDATE PAGO
  // ==========================================================================

  describe('updatePago()', () => {
    const updatePagoDto: UpdatePagoDto = {
      monto: 30000,
      medioPago: 'transferencia',
    };

    it('should call http.patch on movimientos endpoint', () => {
      mockHttpService.patch.mockReturnValue(of({}));
      mockHttpService.get.mockReturnValue(of(createParcialScenario()));

      service.updatePago('ins-123', 'mov-456', updatePagoDto).subscribe();

      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `${MOVIMIENTOS_ENDPOINT}/mov-456`,
        updatePagoDto,
      );
    });

    it('should refresh inscripcion after update', async () => {
      const updatedInscripcion = createParcialScenario();
      mockHttpService.patch.mockReturnValue(of({}));
      mockHttpService.get.mockReturnValue(of(updatedInscripcion));

      const result = await firstValueFrom(service.updatePago('ins-123', 'mov-456', updatePagoDto));

      expect(mockHttpService.get).toHaveBeenCalledWith(`${INSCRIPCIONES_ENDPOINT}/ins-123`);
      expect(result).toEqual(updatedInscripcion);
    });

    it('should return refreshed InscripcionConEstado with pagado estado', async () => {
      const updatedInscripcion = createPagadoSinCajaPersonalScenario();
      mockHttpService.patch.mockReturnValue(of({}));
      mockHttpService.get.mockReturnValue(of(updatedInscripcion));

      const result = await firstValueFrom(service.updatePago('ins-123', 'mov-456', updatePagoDto));

      expect(result.estado).toBe('pagado');
    });

    it('should propagate patch errors', async () => {
      const error = new Error('Movimiento not found');
      mockHttpService.patch.mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.updatePago('ins-123', 'invalid-mov', updatePagoDto)),
      ).rejects.toThrow('not found');
    });
  });

  // ==========================================================================
  // DELETE PAGO
  // ==========================================================================

  describe('deletePago()', () => {
    it('should call http.delete on movimientos endpoint', () => {
      mockHttpService.delete.mockReturnValue(of(undefined));
      mockHttpService.get.mockReturnValue(of(createPendienteScenario()));

      service.deletePago('ins-123', 'mov-456').subscribe();

      expect(mockHttpService.delete).toHaveBeenCalledWith(`${MOVIMIENTOS_ENDPOINT}/mov-456`);
    });

    it('should refresh inscripcion after delete', async () => {
      const refreshedInscripcion = createPendienteScenario();
      mockHttpService.delete.mockReturnValue(of(undefined));
      mockHttpService.get.mockReturnValue(of(refreshedInscripcion));

      const result = await firstValueFrom(service.deletePago('ins-123', 'mov-456'));

      expect(mockHttpService.get).toHaveBeenCalledWith(`${INSCRIPCIONES_ENDPOINT}/ins-123`);
      expect(result).toEqual(refreshedInscripcion);
    });

    it('should return pendiente estado after last payment deleted', async () => {
      const pendienteInscripcion = createPendienteScenario();
      mockHttpService.delete.mockReturnValue(of(undefined));
      mockHttpService.get.mockReturnValue(of(pendienteInscripcion));

      const result = await firstValueFrom(service.deletePago('ins-123', 'last-payment'));

      expect(result.estado).toBe('pendiente');
      expect(result.movimientos.length).toBe(0);
    });

    it('should return parcial estado when payments remain', async () => {
      const parcialInscripcion = createParcialScenario();
      mockHttpService.delete.mockReturnValue(of(undefined));
      mockHttpService.get.mockReturnValue(of(parcialInscripcion));

      const result = await firstValueFrom(service.deletePago('ins-123', 'one-of-many'));

      expect(result.estado).toBe('parcial');
      expect(result.movimientos.length).toBeGreaterThan(0);
    });

    it('should propagate delete errors', async () => {
      const error = new Error('Cannot delete finalized payment');
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.deletePago('ins-123', 'finalized-mov')),
      ).rejects.toThrow('Cannot delete');
    });
  });

  // ==========================================================================
  // INTEGRATION SCENARIOS
  // ==========================================================================

  describe('Integration scenarios', () => {
    it('should handle full payment workflow: create -> pay -> complete', async () => {
      const createDto: CreateInscripcionDto = {
        personaId: 'persona-123',
        ano: 2026,
        tipo: 'scout_argentina',
        montoTotal: 50000,
        montoBonificado: 0,
      };

      const createdInscripcion = createMockInscripcion({
        id: 'new-ins',
        personaId: createDto.personaId,
        ano: createDto.ano,
        tipo: createDto.tipo,
        montoTotal: createDto.montoTotal,
      });
      mockHttpService.post
        .mockReturnValueOnce(of(createdInscripcion)) // create
        .mockReturnValueOnce(of(createPagadoSinCajaPersonalScenario())); // pagar

      // Step 1: Create inscripcion
      const created = await firstValueFrom(service.create(createDto));
      expect(created.id).toBe('new-ins');

      // Step 2: Pay full amount
      const pagoDto: PagoInscripcionDto = {
        montoPagado: 50000,
        medioPago: 'transferencia',
        montoConSaldoPersonal: 0,
      };
      const paid = await firstValueFrom(service.pagarInscripcion(created.id, pagoDto));
      expect(paid.estado).toBe('pagado');
    });

    it('should handle payment correction workflow: pay -> update -> verify', async () => {
      const initialPayment = createParcialScenario();
      const correctedPayment = createPagadoSinCajaPersonalScenario();

      mockHttpService.post.mockReturnValue(of(initialPayment));
      mockHttpService.patch.mockReturnValue(of({}));
      mockHttpService.get.mockReturnValue(of(correctedPayment));

      // Step 1: Initial payment
      const pagoDto: PagoInscripcionDto = {
        montoPagado: 25000,
        medioPago: 'efectivo',
        montoConSaldoPersonal: 0,
      };
      const partial = await firstValueFrom(service.pagarInscripcion('ins-123', pagoDto));
      expect(partial.estado).toBe('parcial');

      // Step 2: Update payment to full amount
      const updateDto: UpdatePagoDto = {
        monto: 50000,
        medioPago: 'transferencia',
      };
      const movimientoId = partial.movimientos[0]?.id || 'mov-1';
      const corrected = await firstValueFrom(
        service.updatePago('ins-123', movimientoId, updateDto),
      );
      expect(corrected.estado).toBe('pagado');
    });
  });
});
