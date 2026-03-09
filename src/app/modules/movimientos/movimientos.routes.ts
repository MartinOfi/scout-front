/**
 * Movimientos Routes
 * Definición de rutas para el módulo de movimientos
 */

import { Routes } from '@angular/router';
import { MovimientosPageComponent } from './pages/movimientos-page.component';
import { MovimientosListComponent } from './components/movimientos-list/movimientos-list.component';
import { MovimientoFormComponent } from './components/movimiento-form/movimiento-form.component';

export const MOVIMIENTOS_ROUTES: Routes = [
  {
    path: '',
    component: MovimientosPageComponent,
    children: [
      {
        path: '',
        component: MovimientosListComponent,
        title: 'Movimientos'
      },
      {
        path: 'nuevo',
        component: MovimientoFormComponent,
        title: 'Nuevo Movimiento'
      },
      {
        path: ':id',
        component: MovimientosListComponent, // TODO: Crear detalle component
        title: 'Detalle Movimiento'
      },
      {
        path: ':id/editar',
        component: MovimientoFormComponent,
        title: 'Editar Movimiento'
      }
    ]
  }
];

export default MOVIMIENTOS_ROUTES;
