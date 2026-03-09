/**
 * Personas Routes Configuration
 * Gestión de Protagonistas, Educadores y Personas Externas
 */

import { Routes } from '@angular/router';

export const PERSONAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/personas-dashboard/personas-dashboard.component')
      .then(m => m.PersonasDashboardComponent),
  },
  
  // Protagonistas
  {
    path: 'protagonistas',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/protagonistas-page/protagonistas-page.component')
          .then(m => m.ProtagonistasPageComponent)
      },
      {
        path: 'crear',
        loadComponent: () => import('./components/protagonistas/form/protagonistas-form.component')
          .then(m => m.ProtagonistasFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/protagonistas/detail/protagonistas-detail.component')
          .then(m => m.ProtagonistasDetailComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./components/protagonistas/form/protagonistas-form.component')
          .then(m => m.ProtagonistasFormComponent)
      }
    ]
  },
  
  // Educadores
  {
    path: 'educadores',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/educadores-page/educadores-page.component')
          .then(m => m.EducadoresPageComponent)
      },
      {
        path: 'crear',
        loadComponent: () => import('./components/educadores/form/educadores-form.component')
          .then(m => m.EducadoresFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/educadores/detail/educadores-detail.component')
          .then(m => m.EducadoresDetailComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./components/educadores/form/educadores-form.component')
          .then(m => m.EducadoresFormComponent)
      }
    ]
  },
  
  // Personas Externas
  {
    path: 'personas-externas',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/personas-externas-page/personas-externas-page.component')
          .then(m => m.PersonasExternasPageComponent)
      },
      {
        path: 'crear',
        loadComponent: () => import('./components/personas-externas/form/personas-externas-form.component')
          .then(m => m.PersonasExternasFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/personas-externas/detail/personas-externas-detail.component')
          .then(m => m.PersonasExternasDetailComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./components/personas-externas/form/personas-externas-form.component')
          .then(m => m.PersonasExternasFormComponent)
      }
    ]
  }
];
