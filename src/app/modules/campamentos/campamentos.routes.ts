/**
 * Campamentos Routes Configuration
 * Lazy loading para campamentos
 */

import { Routes } from '@angular/router';

export const CAMPAMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/campamentos-list/smart/campamentos-list.component')
      .then(m => m.CampamentosListComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./components/campamento-form/smart/campamento-form.component')
      .then(m => m.CampamentoFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/campamento-detail/smart/campamento-detail.component')
      .then(m => m.CampamentoDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/campamento-form/smart/campamento-form.component')
      .then(m => m.CampamentoFormComponent)
  }
];
