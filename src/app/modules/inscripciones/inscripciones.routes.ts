/**
 * Inscripciones Routes Configuration
 * Lazy loading para inscripciones y cuotas
 */

import { Routes } from '@angular/router';

export const INSCRIPCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/inscripciones-list/smart/inscripciones-list.component')
      .then(m => m.InscripcionesListComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./components/inscripcion-form/smart/inscripcion-form.component')
      .then(m => m.InscripcionFormComponent)
  },
  {
    path: 'cuotas',
    loadComponent: () => import('./components/cuotas-list/smart/cuotas-list.component')
      .then(m => m.CuotasListComponent)
  },
  {
    path: ':id/pago',
    loadComponent: () => import('./components/inscripcion-form/smart/inscripcion-form.component')
      .then(m => m.InscripcionFormComponent)
  }
];
