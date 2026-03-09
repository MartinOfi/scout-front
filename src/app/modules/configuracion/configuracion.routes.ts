/**
 * Configuracion Routes Configuration
 * Lazy loading para configuración
 */

import { Routes } from '@angular/router';

export const CONFIGURACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/configuracion-page/configuracion-page.component')
      .then(m => m.ConfiguracionPageComponent)
  }
];
