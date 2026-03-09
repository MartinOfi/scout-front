# Configuración de Montos de Inscripción - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add localStorage-based configuration for Scout Argentina and Group inscription amounts with auto-fill in inscription form.

**Architecture:** Singleton service with Angular Signals for reactivity, localStorage persistence. Configuration page uses existing shared form components. InscripcionFormComponent listens to tipo changes and auto-fills montoTotal.

**Tech Stack:** Angular 21, Signals, localStorage, ReactiveFormsModule

---

## Task 1: Create ConfiguracionService

**Files:**
- Create: `src/app/shared/services/configuracion.service.ts`
- Modify: `src/app/shared/services/index.ts`

**Step 1: Create the service file**

Create `src/app/shared/services/configuracion.service.ts`:

```typescript
/**
 * Configuracion Service
 * Manages localStorage-based configuration for inscription amounts
 * Uses Angular Signals for reactivity
 */

import { Injectable, signal, computed } from '@angular/core';
import { TipoInscripcion } from '../enums';

/**
 * Configuration interface for inscription amounts
 */
export interface InscripcionConfig {
  montoScoutArgentina: number;
  montoGrupo: number;
}

const DEFAULT_CONFIG: InscripcionConfig = {
  montoScoutArgentina: 0,
  montoGrupo: 0,
};

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  private readonly STORAGE_KEY = 'scout_inscripcion_config';

  // Private writable signal
  private readonly _config = signal<InscripcionConfig>(DEFAULT_CONFIG);

  // Public readonly computed signals
  readonly montoScoutArgentina = computed(() => this._config().montoScoutArgentina);
  readonly montoGrupo = computed(() => this._config().montoGrupo);
  readonly config = computed(() => this._config());

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Set monto for Scout Argentina inscription
   */
  setMontoScoutArgentina(monto: number): void {
    this._config.update((current) => ({
      ...current,
      montoScoutArgentina: monto,
    }));
    this.saveToStorage();
  }

  /**
   * Set monto for Grupo inscription
   */
  setMontoGrupo(monto: number): void {
    this._config.update((current) => ({
      ...current,
      montoGrupo: monto,
    }));
    this.saveToStorage();
  }

  /**
   * Get monto by inscription type
   */
  getMontoByTipo(tipo: TipoInscripcion): number {
    const config = this._config();
    return tipo === 'scout_argentina' ? config.montoScoutArgentina : config.montoGrupo;
  }

  /**
   * Update both amounts at once
   */
  updateConfig(config: Partial<InscripcionConfig>): void {
    this._config.update((current) => ({
      ...current,
      ...config,
    }));
    this.saveToStorage();
  }

  /**
   * Load configuration from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<InscripcionConfig>;
        this._config.set({
          montoScoutArgentina: parsed.montoScoutArgentina ?? 0,
          montoGrupo: parsed.montoGrupo ?? 0,
        });
      }
    } catch {
      // If parsing fails, use defaults
      this._config.set(DEFAULT_CONFIG);
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._config()));
    } catch {
      // localStorage might be full or disabled, silently fail
    }
  }
}
```

**Step 2: Export from barrel**

Modify `src/app/shared/services/index.ts`, add at end:

```typescript
export * from './configuracion.service';
```

**Step 3: Verify build**

Run: `npm run build -- --configuration=development 2>&1 | head -20`
Expected: No errors related to ConfiguracionService

**Step 4: Commit**

```bash
git add src/app/shared/services/configuracion.service.ts src/app/shared/services/index.ts
git commit -m "feat(shared): add ConfiguracionService for inscription amounts"
```

---

## Task 2: Update ConfiguracionPageComponent

**Files:**
- Modify: `src/app/modules/configuracion/pages/configuracion-page/configuracion-page.component.ts`
- Create: `src/app/modules/configuracion/pages/configuracion-page/configuracion-page.component.html`

**Step 1: Update the component TypeScript**

Replace `src/app/modules/configuracion/pages/configuracion-page/configuracion-page.component.ts`:

```typescript
/**
 * Configuracion Page Component
 * Smart Component - Configuración del sistema
 */

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { FormContainerComponent } from '../../../../shared/components/form/form-container/form-container.component';
import { FormFieldComponent } from '../../../../shared/components/form/form-field/form-field.component';
import { NumberFieldComponent } from '../../../../shared/components/form/number-field/number-field.component';
import { FormActionsComponent } from '../../../../shared/components/form/form-actions/form-actions.component';
import { ConfiguracionService } from '../../../../shared/services';
import { NotificationService } from '../../../../shared/services';

@Component({
  selector: 'app-configuracion-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    FormContainerComponent,
    FormFieldComponent,
    NumberFieldComponent,
    FormActionsComponent,
  ],
  templateUrl: './configuracion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionPageComponent implements OnInit {
  private readonly configService = inject(ConfiguracionService);
  private readonly notificationService = inject(NotificationService);

  readonly montoScoutArgentinaCtrl = new FormControl<number>(0, {
    nonNullable: true,
    validators: [Validators.min(0)],
  });

  readonly montoGrupoCtrl = new FormControl<number>(0, {
    nonNullable: true,
    validators: [Validators.min(0)],
  });

  ngOnInit(): void {
    // Load current values from service
    this.montoScoutArgentinaCtrl.setValue(this.configService.montoScoutArgentina());
    this.montoGrupoCtrl.setValue(this.configService.montoGrupo());
  }

  guardar(): void {
    if (this.montoScoutArgentinaCtrl.invalid || this.montoGrupoCtrl.invalid) {
      this.notificationService.showError('Por favor, ingrese valores válidos');
      return;
    }

    this.configService.updateConfig({
      montoScoutArgentina: this.montoScoutArgentinaCtrl.value,
      montoGrupo: this.montoGrupoCtrl.value,
    });

    this.notificationService.showSuccess('Configuración guardada exitosamente');
  }
}
```

**Step 2: Create the template**

Create `src/app/modules/configuracion/pages/configuracion-page/configuracion-page.component.html`:

```html
<app-form-container title="Configuración de Inscripciones" icon="settings">
  <app-form-field label="Monto Inscripción Scout Argentina">
    <app-number-field
      [formControl]="montoScoutArgentinaCtrl"
      [min]="0"
      placeholder="0">
    </app-number-field>
  </app-form-field>

  <app-form-field label="Monto Inscripción de Grupo">
    <app-number-field
      [formControl]="montoGrupoCtrl"
      [min]="0"
      placeholder="0">
    </app-number-field>
  </app-form-field>

  <app-form-actions>
    <button mat-flat-button color="primary" (click)="guardar()">
      Guardar
    </button>
  </app-form-actions>
</app-form-container>
```

**Step 3: Verify build**

Run: `npm run build -- --configuration=development 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/modules/configuracion/pages/configuracion-page/
git commit -m "feat(configuracion): add inscription amounts configuration UI"
```

---

## Task 3: Integrate with InscripcionFormComponent

**Files:**
- Modify: `src/app/modules/inscripciones/components/inscripcion-form/inscripcion-form.component.ts`

**Step 1: Add ConfiguracionService integration**

Modify `src/app/modules/inscripciones/components/inscripcion-form/inscripcion-form.component.ts`:

Add import at top:
```typescript
import { ConfiguracionService } from '../../../../shared/services';
```

Add injection after existing injects (around line 42):
```typescript
private readonly configService = inject(ConfiguracionService);
```

Modify `ngOnInit()` method to add auto-fill logic:

```typescript
ngOnInit(): void {
  this.inscripcionId = this.route.snapshot.paramMap.get('id');
  this.isEditing = !!this.inscripcionId;

  if (this.isEditing && this.inscripcionId) {
    this.loadInscripcion(this.inscripcionId);
  } else {
    // Set initial monto based on default tipo
    this.setMontoFromConfig();

    // Listen for tipo changes to auto-fill monto
    this.inscripcionForm.get('tipo')?.valueChanges.subscribe((tipo: TipoInscripcion) => {
      this.inscripcionForm.get('montoTotal')?.setValue(this.configService.getMontoByTipo(tipo));
    });
  }
}
```

Add new private method after `loadInscripcion`:
```typescript
private setMontoFromConfig(): void {
  const tipo = this.inscripcionForm.get('tipo')?.value as TipoInscripcion;
  const monto = this.configService.getMontoByTipo(tipo);
  this.inscripcionForm.get('montoTotal')?.setValue(monto);
}
```

**Step 2: Verify build**

Run: `npm run build -- --configuration=development 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/modules/inscripciones/components/inscripcion-form/inscripcion-form.component.ts
git commit -m "feat(inscripciones): auto-fill monto from configuration"
```

---

## Task 4: Manual Testing Checklist

**Step 1: Start dev server**

Run: `npm start`

**Step 2: Test configuration page**

1. Navigate to `/configuracion`
2. Verify both fields show 0 initially
3. Enter 15000 for Scout Argentina
4. Enter 5000 for Grupo
5. Click Guardar
6. Verify success notification appears
7. Refresh page - values should persist

**Step 3: Test inscription form**

1. Navigate to `/inscripciones/nueva` (or wherever the form is)
2. Verify montoTotal shows 15000 (default tipo is scout_argentina)
3. Change tipo to "Grupo"
4. Verify montoTotal changes to 5000
5. Change tipo back to "Scout Argentina"
6. Verify montoTotal changes to 15000

**Step 4: Test localStorage persistence**

1. Open DevTools > Application > Local Storage
2. Verify key `scout_inscripcion_config` exists
3. Verify JSON structure: `{"montoScoutArgentina":15000,"montoGrupo":5000}`

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | ConfiguracionService | `shared/services/configuracion.service.ts` |
| 2 | ConfiguracionPageComponent UI | `configuracion-page.component.ts`, `.html` |
| 3 | InscripcionForm integration | `inscripcion-form.component.ts` |
| 4 | Manual testing | N/A |

**Total commits:** 3
