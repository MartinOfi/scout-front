/**
 * Eventos Routes Configuration
 * Lazy loading para eventos de venta y grupo
 */

import { Routes } from '@angular/router';

export const EVENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/eventos-list/smart/eventos-list.component')
      .then(m => m.EventosListComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./components/evento-form/smart/evento-form.component')
      .then(m => m.EventoFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/evento-detail/smart/evento-detail.component')
      .then(m => m.EventoDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/evento-form/smart/evento-form.component')
      .then(m => m.EventoFormComponent)
  }
];
