import {
  ReporteEvento,
  ReporteGrupo,
  ReporteVentaBase,
  ReporteVentaCuentasPersonales,
} from '../../../../shared/models';
import { PersonaType } from '../../../../shared/enums/persona.enum';
import { ReporteSectionDescriptor } from './reporte-section.model';
import { ReporteKpiItem } from './sections/reporte-kpi-item';
import { formatArs, formatPct } from './reporte-format';
import { ReporteHeaderSection } from './sections/reporte-header.section';
import { ReporteKpisSection } from './sections/reporte-kpis.section';
import { ReporteResultadoEconomicoSection } from './sections/reporte-resultado-economico.section';
import { ReporteEgresosSection } from './sections/reporte-egresos.section';
import { ReporteIntegridadSection } from './sections/reporte-integridad.section';
import { ReporteProductosSection } from './sections/reporte-productos.section';
import { ReportePorTipoPersonaSection } from './sections/reporte-por-tipo-persona.section';
import { ReporteRankingVendedoresSection } from './sections/reporte-ranking-vendedores.section';
import { ReporteDetalleVendedorSection } from './sections/reporte-detalle-vendedor.section';
import { ReporteStockEntregaSection } from './sections/reporte-stock-entrega.section';
import { ReporteHorariosEntregaSection } from './sections/reporte-horarios-entrega.section';
import { ReporteParticipacionRamaSection } from './sections/reporte-participacion-rama.section';
import { ReporteGananciaPersonaSection } from './sections/reporte-ganancia-persona.section';
import { ReporteIngresosItemizadosSection } from './sections/reporte-ingresos-itemizados.section';

const ACCENT = {
  azul: '#60a5fa',
  verde: '#10b981',
  rojo: '#f43f5e',
  violeta: '#a78bfa',
  amarillo: '#fbbf24',
  cyan: '#22d3ee',
} as const;

function ventaKpiItems(vm: ReporteVentaBase): ReporteKpiItem[] {
  const educ = vm.porTipoPersona.find((t) => t.tipo === PersonaType.EDUCADOR)?.vendedores ?? 0;
  const prot =
    vm.porTipoPersona.find((t) => t.tipo === PersonaType.PROTAGONISTA)?.vendedores ?? 0;
  return [
    {
      label: 'Recaudación bruta',
      value: formatArs(vm.kpis.recaudacionBruta),
      sub: `${vm.kpis.unidades} unidades vendidas`,
      accent: ACCENT.azul,
    },
    {
      label: 'Resultado neto real',
      value: formatArs(vm.kpis.netoReal),
      sub: 'Recaudación − egresos',
      accent: ACCENT.verde,
    },
    {
      label: 'Egresos',
      value: formatArs(vm.kpis.egresos),
      sub: `${vm.egresos.length} gastos (insumos)`,
      accent: ACCENT.rojo,
    },
    {
      label: 'Margen neto',
      value: formatPct(vm.kpis.margen),
      sub: 'Sobre recaudación bruta',
      accent: ACCENT.violeta,
    },
    {
      label: 'Vendedores',
      value: String(vm.vendedores.length),
      sub: `${educ} educadores · ${prot} protagonistas`,
      accent: ACCENT.amarillo,
    },
    {
      label: 'Pendiente de retiro',
      value: String(vm.stock.totalPendiente),
      sub: `de ${vm.stock.totalVendido} vendidas`,
      accent: ACCENT.cyan,
    },
  ];
}

function grupoKpiItems(vm: ReporteGrupo): ReporteKpiItem[] {
  return [
    { label: 'Ingresos', value: formatArs(vm.kpis.recaudacionBruta), accent: ACCENT.azul },
    { label: 'Egresos', value: formatArs(vm.kpis.egresos), accent: ACCENT.rojo },
    { label: 'Resultado neto', value: formatArs(vm.kpis.netoReal), accent: ACCENT.verde },
    { label: 'Margen', value: formatPct(vm.kpis.margen), accent: ACCENT.violeta },
  ];
}

/** Secciones genéricas: header + KPIs (items según variante) + resultado económico. */
function genericSections(
  vm: ReporteEvento,
  kpiItems: ReporteKpiItem[],
): ReporteSectionDescriptor[] {
  return [
    { key: 'header', component: ReporteHeaderSection, inputs: () => ({ evento: vm.evento }) },
    { key: 'kpis', component: ReporteKpisSection, inputs: () => ({ items: kpiItems }) },
    {
      key: 'resultado',
      component: ReporteResultadoEconomicoSection,
      inputs: () => ({ kpis: vm.kpis }),
    },
  ];
}

/** Bloques comunes a eventos de venta (productos, ranking, stock, etc.). */
function ventaSections(vm: ReporteVentaBase): ReporteSectionDescriptor[] {
  return [
    { key: 'productos', component: ReporteProductosSection, inputs: () => ({ productos: vm.productos }) },
    {
      key: 'por-tipo',
      component: ReportePorTipoPersonaSection,
      inputs: () => ({ porTipo: vm.porTipoPersona }),
    },
    {
      key: 'ranking',
      component: ReporteRankingVendedoresSection,
      inputs: () => ({ vendedores: vm.vendedores }),
    },
    {
      key: 'detalle',
      component: ReporteDetalleVendedorSection,
      inputs: () => ({ vendedores: vm.vendedores }),
    },
    { key: 'stock', component: ReporteStockEntregaSection, inputs: () => ({ stock: vm.stock }) },
    {
      key: 'horarios',
      component: ReporteHorariosEntregaSection,
      inputs: () => ({ horarios: vm.horariosEntrega }),
    },
    {
      key: 'rama',
      component: ReporteParticipacionRamaSection,
      inputs: () => ({ porRama: vm.porRama }),
    },
  ];
}

function egresosEIntegridad(vm: ReporteEvento): ReporteSectionDescriptor[] {
  return [
    { key: 'egresos', component: ReporteEgresosSection, inputs: () => ({ egresos: vm.egresos }) },
    {
      key: 'integridad',
      component: ReporteIntegridadSection,
      inputs: () => ({ flags: vm.integridad }),
    },
  ];
}

/**
 * Devuelve la lista ordenada de secciones para la variante del reporte.
 * Agregar una variante = un `case` más; las secciones se reutilizan.
 */
export function sectionsFor(vm: ReporteEvento): ReporteSectionDescriptor[] {
  switch (vm.variante) {
    case 'venta_caja_grupo':
      return [
        ...genericSections(vm, ventaKpiItems(vm)),
        ...ventaSections(vm),
        ...egresosEIntegridad(vm),
      ];

    case 'venta_cuentas_personales': {
      const cp = vm as ReporteVentaCuentasPersonales;
      return [
        ...genericSections(vm, ventaKpiItems(cp)),
        ...ventaSections(cp),
        {
          key: 'ganancia-persona',
          component: ReporteGananciaPersonaSection,
          inputs: () => ({ ganancias: cp.gananciaPorPersona }),
        },
        ...egresosEIntegridad(vm),
      ];
    }

    case 'grupo': {
      const g = vm as ReporteGrupo;
      return [
        ...genericSections(vm, grupoKpiItems(g)),
        {
          key: 'ingresos',
          component: ReporteIngresosItemizadosSection,
          inputs: () => ({ ingresos: g.ingresosItemizados }),
        },
        ...egresosEIntegridad(vm),
      ];
    }
  }
}
