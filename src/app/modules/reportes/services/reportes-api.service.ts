import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';
import { API_CONFIG } from '../../../shared/constants/api.constants';
import { PersonaDeuda, DeudaFilters } from '../models/deuda.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportesApiService {
  private readonly http = inject(HttpService);

  getDeudas(filters: DeudaFilters): Observable<PersonaDeuda[]> {
    const params: Record<string, string | number | boolean> = {};
    if (filters.rama) params['rama'] = filters.rama;
    if (filters.ano) params['ano'] = filters.ano;
    if (filters.tipo) params['tipo'] = filters.tipo;
    return this.http.get<PersonaDeuda[]>(API_CONFIG.ENDPOINTS.REPORTES_DEUDAS, params);
  }
}
