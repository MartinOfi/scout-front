/**
 * Cajas Routes
 * Definición de rutas para el módulo de cajas
 */

import { Routes } from '@angular/router';
import { CajasPageComponent } from './pages/cajas-page.component';

export const CAJAS_ROUTES: Routes = [
  {
    path: '',
    component: CajasPageComponent,
    title: 'Cajas'
  }
];

export default CAJAS_ROUTES;
