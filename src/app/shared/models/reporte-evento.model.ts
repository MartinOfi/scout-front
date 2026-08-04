/**
 * Reporte de evento — contrato unión-discriminada por `variante`.
 * Espejo del DTO backend: src/modules/eventos/reporte/dtos/*.
 * El frontend estrecha la unión con `variante` para elegir las secciones.
 */
import { TipoEvento, DestinoGanancia } from '../enums';
import { PersonaType } from '../enums/persona.enum';

export type ReporteVariante = 'venta_caja_grupo' | 'venta_cuentas_personales' | 'grupo';

export type ReporteSeveridad = 'alta' | 'media' | 'ok';

export interface ReporteMeta {
  id: string;
  nombre: string;
  fecha: string;
  tipo: TipoEvento;
  destinoGanancia: DestinoGanancia | null;
  estaCerrado: boolean;
}

export interface ReporteKpis {
  recaudacionBruta: number;
  ganancia: number;
  egresos: number;
  netoReal: number;
  margen: number;
  unidades: number;
  pendienteReembolso: number;
  /**
   * Costo recuperado por el grupo (solo destino cuentas_personales): Σ
   * precioCosto × cantidad devuelto a la caja grupo. 0 en otros destinos.
   */
  recuperoCosto: number;
}

export interface ReporteEgreso {
  descripcion: string;
  responsableNombre: string | null;
  medioPago: string;
  estadoPago: string;
  monto: number;
}

export interface ReporteIntegridadFlag {
  severidad: ReporteSeveridad;
  mensaje: string;
}

export interface ReporteProducto {
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  margenUnitario: number;
  unidades: number;
  recaudado: number;
  porcentaje: number;
}

export interface ReportePorTipoPersona {
  tipo: PersonaType;
  label: string;
  vendedores: number;
  unidades: number;
  recaudado: number;
  porcentaje: number;
}

export interface ReportePorRama {
  grupo: string;
  esEducador: boolean;
  vendedores: number;
  unidades: number;
  recaudado: number;
  porcentaje: number;
}

export interface ReporteVendedor {
  vendedorId: string;
  nombre: string;
  tipo: PersonaType;
  rama: string | null;
  unidades: number;
  recaudado: number;
  porcentaje: number;
  entregado: number;
  pendiente: number;
}

export interface ReporteStockProducto {
  nombre: string;
  vendido: number;
  entregado: number;
  pendiente: number;
}

export interface ReporteStock {
  productos: ReporteStockProducto[];
  totalVendido: number;
  totalEntregado: number;
  totalPendiente: number;
}

export interface ReporteHorarioFranja {
  desde: string;
  hasta: string;
  entregas: number;
  porciones: number;
}

export interface ReporteEntregaFueraDia {
  dia: string;
  entregas: number;
  porciones: number;
}

export interface ReporteHorariosEntrega {
  diaPrincipal: string;
  franjas: ReporteHorarioFranja[];
  totalEntregas: number;
  totalPorciones: number;
  fueraDeDia: ReporteEntregaFueraDia[];
}

export interface ReporteIngresoItem {
  descripcion: string;
  responsableNombre: string | null;
  medioPago: string;
  monto: number;
  fecha: string;
}

export interface ReporteGananciaPersona {
  personaId: string;
  nombre: string;
  ganancia: number;
}

/** Campos comunes a todas las variantes. */
export interface ReporteBase {
  generadoEn: string;
  evento: ReporteMeta;
  kpis: ReporteKpis;
  egresos: ReporteEgreso[];
  integridad: ReporteIntegridadFlag[];
}

/** Bloques comunes a todo evento de VENTA. */
export interface ReporteVentaBase extends ReporteBase {
  productos: ReporteProducto[];
  porTipoPersona: ReportePorTipoPersona[];
  porRama: ReportePorRama[];
  vendedores: ReporteVendedor[];
  stock: ReporteStock;
  horariosEntrega: ReporteHorariosEntrega;
}

export interface ReporteVentaCajaGrupo extends ReporteVentaBase {
  variante: 'venta_caja_grupo';
}

export interface ReporteVentaCuentasPersonales extends ReporteVentaBase {
  variante: 'venta_cuentas_personales';
  gananciaPorPersona: ReporteGananciaPersona[];
}

/** Un lado de un evento mixto. */
export interface ReporteDestinoLado {
  recaudado: number;
  ganancia: number;
  unidades: number;
  /** Plata registrada que todavía no entró. */
  pendienteCobro: number;
  /**
   * Lo que efectivamente le queda a este destino. Para el grupo descuenta los
   * egresos del evento y suma el recupero de costo; para las cuentas personales
   * es la suma de márgenes, sin descuento de gastos.
   */
  neto: number;
}

export interface ReportePorDestino {
  cajaGrupo: ReporteDestinoLado;
  cuentasPersonales: ReporteDestinoLado;
}

export interface ReporteVentaMixta extends ReporteVentaBase {
  variante: 'venta_mixta';
  porDestino: ReportePorDestino;
  gananciaPorPersona: ReporteGananciaPersona[];
}

export interface ReporteGrupo extends ReporteBase {
  variante: 'grupo';
  ingresosItemizados: ReporteIngresoItem[];
}

export type ReporteEvento =
  ReporteVentaCajaGrupo | ReporteVentaCuentasPersonales | ReporteVentaMixta | ReporteGrupo;
