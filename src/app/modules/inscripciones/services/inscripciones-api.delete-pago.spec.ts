/**
 * InscripcionesApiService.deletePago — regresión del bug "no deja eliminar pagos".
 *
 * El pago de una inscripción se debe eliminar desde el endpoint de la
 * inscripción: DELETE /movimientos/:id está bloqueado por el backend para
 * movimientos vinculados a una inscripción.
 */

import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';

import { InscripcionesApiService } from './inscripciones-api.service';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';
import { InscripcionConEstado } from '../../../shared/models';

describe('InscripcionesApiService.deletePago', () => {
  const INSCRIPCIONES_ENDPOINT = API_CONFIG.ENDPOINTS.INSCRIPCIONES;
  const MOVIMIENTOS_ENDPOINT = API_CONFIG.ENDPOINTS.MOVIMIENTOS;
  const inscripcionActualizada = { id: 'ins-123', estado: 'pendiente' } as InscripcionConEstado;

  let service: InscripcionesApiService;
  let httpDelete: Mock;

  beforeEach(() => {
    httpDelete = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        InscripcionesApiService,
        { provide: HttpService, useValue: { get: vi.fn(), delete: httpDelete } },
      ],
    });
    service = TestBed.inject(InscripcionesApiService);
  });

  it('llama a DELETE /inscripciones/:id/pagos/:movimientoId, no a /movimientos/:id', () => {
    httpDelete.mockReturnValue(of(inscripcionActualizada));

    service.deletePago('ins-123', 'mov-456').subscribe();

    expect(httpDelete).toHaveBeenCalledWith(`${INSCRIPCIONES_ENDPOINT}/ins-123/pagos/mov-456`);
    expect(httpDelete).not.toHaveBeenCalledWith(`${MOVIMIENTOS_ENDPOINT}/mov-456`);
  });

  it('devuelve la inscripción actualizada que responde el backend', async () => {
    httpDelete.mockReturnValue(of(inscripcionActualizada));

    const result = await firstValueFrom(service.deletePago('ins-123', 'mov-456'));

    expect(result).toEqual(inscripcionActualizada);
  });

  it('propaga el error del backend', async () => {
    httpDelete.mockReturnValue(throwError(() => new Error('Pago no encontrado')));

    await expect(firstValueFrom(service.deletePago('ins-123', 'mov-456'))).rejects.toThrow(
      'Pago no encontrado',
    );
  });
});
