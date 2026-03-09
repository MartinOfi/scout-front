/**
 * Reportes Routes Configuration
 * Lazy loading para reportes
 */

import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'deudas',
    pathMatch: 'full'
  },
  {
    path: 'deudas',
    loadComponent: () => import('./components/reporte-deudas/reporte-deudas.component')
      .then(m => m.ReporteDeudasComponent)
  },
  {
    path: 'reembolsos',
    loadComponent: () => import('./components/reporte-reembolsos/reporte-reembolsos.component')
      .then(m => m.ReporteReembolsosComponent)
  },
  {
    path: 'caja',
    loadComponent: () => import('./components/reporte-caja/reporte-caja.component')
      .then(m => m.ReporteCajaComponent)
  },
  {
    path: 'eventos',
    loadComponent: () => import('./components/reporte-eventos/reporte-eventos.component')
      .then(m => m.ReporteEventosComponent)
  },
  {
    path: 'comprobantes',
    loadComponent: () => import('./components/reporte-comprobantes/reporte-comprobantes.component')
      .then(m => m.ReporteComprobantesComponent)
  }
];
