import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PersonasApiService } from './personas-api.service';
import { HttpService } from '../../../shared/services';
import { API_CONFIG } from '../../../shared/constants';

describe('PersonasApiService', () => {
  let service: PersonasApiService;
  let http: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    http = { get: vi.fn().mockReturnValue(of([])) };
    TestBed.configureTestingModule({
      providers: [PersonasApiService, { provide: HttpService, useValue: http }],
    });
    service = TestBed.inject(PersonasApiService);
  });

  it('getAllActivos pide solo activos al backend (soloActivos=true)', () => {
    service.getAllActivos().subscribe();

    expect(http.get).toHaveBeenCalledWith(API_CONFIG.ENDPOINTS.PERSONAS, {
      [API_CONFIG.QUERY_PARAMS.SOLO_ACTIVOS]: true,
    });
  });

  it('getAll no filtra: trae también a los deshabilitados', () => {
    service.getAll().subscribe();

    expect(http.get).toHaveBeenCalledWith(API_CONFIG.ENDPOINTS.PERSONAS);
  });
});
