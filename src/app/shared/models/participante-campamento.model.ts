/**
 * Participante Campamento Model
 * Registro de participantes en campamentos
 */

import { PagoCampamento } from './pago-campamento.model';

export interface ParticipanteCampamento {
  id: string;
  campamentoId: string;
  personaId: string;
  montoTotal: number;
  montoPagado: number;
  pagos: PagoCampamento[];
}

export interface CreateParticipanteCampamentoDto {
  personaId: string;
  montoTotal: number;
}
