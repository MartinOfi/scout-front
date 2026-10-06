/**
 * Inscripciones Routes Configuration
 * Lazy loading para inscripciones
 */

import { Routes } from '@angular/router';

export const INSCRIPCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inscripciones-list/inscripciones-list.component').then(
        (m) => m.InscripcionesListComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/inscripciones-dashboard/inscripciones-dashboard.component').then(
        (m) => m.InscripcionesDashboardComponent,
      ),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./components/inscripcion-form/smart/inscripcion-form.component').then(
        (m) => m.InscripcionFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/inscripcion-detail/smart/inscripcion-detail.component').then(
        (m) => m.InscripcionDetailComponent,
      ),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./components/inscripcion-form/smart/inscripcion-form.component').then(
        (m) => m.InscripcionFormComponent,
      ),
  },
  {
    path: ':id/pago',
    loadComponent: () =>
      import('./components/inscripcion-form/smart/inscripcion-form.component').then(
        (m) => m.InscripcionFormComponent,
      ),
  },
];
