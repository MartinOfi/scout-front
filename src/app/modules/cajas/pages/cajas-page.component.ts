/**
 * Cajas Page Component
 * Página principal del módulo de cajas
 * SIN any - tipado estricto
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

import { CajaGrupoComponent } from '../components/caja-grupo/caja-grupo.component';
import { FondosRamaComponent } from '../components/fondos-rama/fondos-rama.component';
import { CuentasPersonalesComponent } from '../components/cuentas-personales/cuentas-personales.component';

@Component({
  selector: 'app-cajas-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    CajaGrupoComponent,
    FondosRamaComponent,
    CuentasPersonalesComponent
  ],
  templateUrl: './cajas-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CajasPageComponent {}
