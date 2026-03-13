/**
 * Personas Routes Configuration
 * Gestión de Protagonistas, Educadores y Personas Externas
 */

import { Routes } from '@angular/router';

export const PERSONAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/personas-dashboard/personas-dashboard.component').then(
        (m) => m.PersonasDashboardComponent,
      ),
  },

  // Protagonistas
  {
    path: 'protagonistas',
    children: [
      {
        path: 'crear',
        loadComponent: () =>
          import('./components/protagonistas/form/protagonistas-form.component').then(
            (m) => m.ProtagonistasFormComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/persona-dashboard/persona-dashboard.component').then(
            (m) => m.PersonaDashboardComponent,
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./components/protagonistas/form/protagonistas-form.component').then(
            (m) => m.ProtagonistasFormComponent,
          ),
      },
    ],
  },

  // Educadores
  {
    path: 'educadores',
    children: [
      {
        path: 'crear',
        loadComponent: () =>
          import('./components/educadores/form/educadores-form.component').then(
            (m) => m.EducadoresFormComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/persona-dashboard/persona-dashboard.component').then(
            (m) => m.PersonaDashboardComponent,
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./components/educadores/form/educadores-form.component').then(
            (m) => m.EducadoresFormComponent,
          ),
      },
    ],
  },

  // Personas Externas
  {
    path: 'personas-externas',
    children: [
      {
        path: 'crear',
        loadComponent: () =>
          import('./components/personas-externas/form/personas-externas-form.component').then(
            (m) => m.PersonasExternasFormComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/personas-externas/detail/personas-externas-detail.component').then(
            (m) => m.PersonasExternasDetailComponent,
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./components/personas-externas/form/personas-externas-form.component').then(
            (m) => m.PersonasExternasFormComponent,
          ),
      },
    ],
  },
];
