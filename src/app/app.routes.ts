/**
 * App Routes Configuration
 * Lazy loading para todos los módulos principales
 * Layout wrapper para rutas autenticadas
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutContainerComponent } from './layout';
import type { RouteDataWithPage } from './layout';

export const routes: Routes = [
  // Login (público - sin layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // Rutas autenticadas con layout
  {
    path: '',
    component: LayoutContainerComponent,
    canActivate: [authGuard],
    children: [
      // Ruta principal - Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: {
          page: {
            title: 'Dashboard',
            subtitle: 'Bienvenido al Sistema de Gestión Financiera Scout',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Personas (Protagonistas, Educadores, Personas Externas)
      {
        path: 'personas',
        loadChildren: () =>
          import('./modules/personas/personas.routes').then(
            (m) => m.PERSONAS_ROUTES
          ),
        data: {
          page: {
            title: 'Gestión de Personas',
            subtitle: 'Administra protagonistas, educadores y personas externas',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Cajas (Caja Grupo, Fondos Rama, Cuentas Personales)
      {
        path: 'cajas',
        loadChildren: () =>
          import('./modules/cajas/cajas.routes').then((m) => m.CAJAS_ROUTES),
        data: {
          page: {
            title: 'Gestión Financiera',
            subtitle: 'Administra cajas, fondos de rama y cuentas personales',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Movimientos
      {
        path: 'movimientos',
        loadChildren: () =>
          import('./modules/movimientos/movimientos.routes').then(
            (m) => m.MOVIMIENTOS_ROUTES
          ),
        data: {
          page: {
            title: 'Movimientos',
            subtitle: 'Visualiza y gestiona los movimientos financieros',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Inscripciones
      {
        path: 'inscripciones',
        loadChildren: () =>
          import('./modules/inscripciones/inscripciones.routes').then(
            (m) => m.INSCRIPCIONES_ROUTES
          ),
        data: {
          page: {
            title: 'Inscripciones y Cuotas',
            subtitle: 'Gestión de inscripciones Scout Argentina y cuotas de grupo',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Eventos
      {
        path: 'eventos',
        loadChildren: () =>
          import('./modules/eventos/eventos.routes').then(
            (m) => m.EVENTOS_ROUTES
          ),
        data: {
          page: {
            title: 'Eventos',
            subtitle: 'Organiza los eventos del grupo',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Campamentos
      {
        path: 'campamentos',
        loadChildren: () =>
          import('./modules/campamentos/campamentos.routes').then(
            (m) => m.CAMPAMENTOS_ROUTES
          ),
        data: {
          page: {
            title: 'Campamentos',
            subtitle: 'Planifica y gestiona los campamentos del grupo',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Reportes
      {
        path: 'reportes',
        loadChildren: () =>
          import('./modules/reportes/reportes.routes').then(
            (m) => m.REPORTES_ROUTES
          ),
        data: {
          page: {
            title: 'Reportes',
            subtitle: 'Genera y visualiza reportes del grupo',
          },
        } satisfies RouteDataWithPage,
      },

      // Módulo Configuración
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./modules/configuracion/configuracion.routes').then(
            (m) => m.CONFIGURACION_ROUTES
          ),
        data: {
          page: {
            title: 'Configuración',
            subtitle: 'Configura los parámetros del sistema',
          },
        } satisfies RouteDataWithPage,
      },
    ],
  },

  // Ruta 404 - Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
