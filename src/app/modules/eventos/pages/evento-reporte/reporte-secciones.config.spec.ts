import { sectionsFor } from './reporte-secciones.config';
import {
  ReporteGrupo,
  ReporteVentaCajaGrupo,
  ReporteVentaCuentasPersonales,
} from '../../../../shared/models';

const BASE = {
  generadoEn: '2026-06-01T00:00:00.000Z',
  evento: {
    id: 'e1',
    nombre: 'Evento',
    fecha: '2026-05-25',
    tipo: 'venta',
    destinoGanancia: 'caja_grupo',
    estaCerrado: false,
  },
  kpis: {
    recaudacionBruta: 0,
    ganancia: 0,
    egresos: 0,
    netoReal: 0,
    margen: 0,
    unidades: 0,
    pendienteReembolso: 0,
  },
  egresos: [],
  integridad: [],
} as const;

const VENTA_BLOCKS = {
  productos: [],
  porTipoPersona: [],
  porRama: [],
  vendedores: [],
  stock: { productos: [], totalVendido: 0, totalEntregado: 0, totalPendiente: 0 },
  horariosEntrega: {
    diaPrincipal: '2026-05-25',
    franjas: [],
    totalEntregas: 0,
    totalPorciones: 0,
    fueraDeDia: [],
  },
} as const;

describe('sectionsFor', () => {
  it('venta_caja_grupo: secciones genéricas + venta + egresos/integridad, sin ganancia-persona', () => {
    const vm = {
      ...BASE,
      ...VENTA_BLOCKS,
      variante: 'venta_caja_grupo',
    } as unknown as ReporteVentaCajaGrupo;

    const keys = sectionsFor(vm).map((s) => s.key);

    expect(keys).toContain('header');
    expect(keys).toContain('productos');
    expect(keys).toContain('ranking');
    expect(keys).toContain('rama');
    expect(keys).toContain('integridad');
    expect(keys).not.toContain('ganancia-persona');
    expect(keys).not.toContain('ingresos');
  });

  it('venta_cuentas_personales: incluye ganancia-persona', () => {
    const vm = {
      ...BASE,
      ...VENTA_BLOCKS,
      variante: 'venta_cuentas_personales',
      gananciaPorPersona: [],
    } as unknown as ReporteVentaCuentasPersonales;

    const keys = sectionsFor(vm).map((s) => s.key);
    expect(keys).toContain('ganancia-persona');
    expect(keys).toContain('productos');
  });

  it('grupo: ingresos itemizados, sin secciones de venta', () => {
    const vm = {
      ...BASE,
      variante: 'grupo',
      ingresosItemizados: [],
    } as unknown as ReporteGrupo;

    const keys = sectionsFor(vm).map((s) => s.key);
    expect(keys).toContain('ingresos');
    expect(keys).not.toContain('productos');
    expect(keys).not.toContain('ranking');
    expect(keys).toContain('integridad');
  });
});
