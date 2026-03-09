# Diseño: Configuración de Montos de Inscripción

**Fecha:** 2026-03-09
**Estado:** Aprobado

## Resumen

Implementar configuración de montos de inscripción guardados en localStorage, accesibles desde la página de configuración y utilizados para auto-completar el formulario de inscripciones.

## Requisitos

- 2 configuraciones: monto Scout Argentina y monto Grupo
- Guardado en localStorage (persistencia local)
- Valores fijos modificables en cualquier momento (sin variación por año)
- Sin valores por defecto (inician en 0)
- Auto-completar montoTotal al seleccionar tipo de inscripción

## Arquitectura

### 1. ConfiguracionService

**Ubicación:** `src/app/shared/services/configuracion.service.ts`

```typescript
interface InscripcionConfig {
  montoScoutArgentina: number;
  montoGrupo: number;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly STORAGE_KEY = 'scout_inscripcion_config';

  // Signals privados
  private readonly _config = signal<InscripcionConfig>({
    montoScoutArgentina: 0,
    montoGrupo: 0
  });

  // Signals públicos readonly
  readonly montoScoutArgentina = computed(() => this._config().montoScoutArgentina);
  readonly montoGrupo = computed(() => this._config().montoGrupo);

  constructor() {
    this.loadFromStorage();
  }

  setMontoScoutArgentina(monto: number): void;
  setMontoGrupo(monto: number): void;
  getMontoByTipo(tipo: TipoInscripcion): number;

  private loadFromStorage(): void;
  private saveToStorage(): void;
}
```

### 2. ConfiguracionPageComponent

**Ubicación:** `src/app/modules/configuracion/pages/configuracion-page/`

**Componentes utilizados:**
- `FormContainerComponent` - Contenedor con título
- `FormFieldComponent` - Wrapper con label
- `NumberFieldComponent` - Input numérico
- `FormActionsComponent` - Botones de acción

**Template:**
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

**Comportamiento:**
- Al cargar, lee valores actuales del ConfiguracionService
- Botón "Guardar" actualiza ambos valores y muestra notificación de éxito
- Validación: solo números >= 0

### 3. Integración en InscripcionFormComponent

**Ubicación:** `src/app/modules/inscripciones/components/inscripcion-form/`

**Cambios:**
- Inyectar `ConfiguracionService`
- Escuchar cambios en el campo 'tipo' para auto-completar montoTotal
- Setear valor inicial al cargar el formulario (solo en modo creación)

```typescript
private readonly configService = inject(ConfiguracionService);

// En ngOnInit
this.inscripcionForm.get('tipo')?.valueChanges.subscribe((tipo: TipoInscripcion) => {
  if (!this.isEditing) {
    const monto = this.configService.getMontoByTipo(tipo);
    this.inscripcionForm.get('montoTotal')?.setValue(monto);
  }
});

// Valor inicial
if (!this.isEditing) {
  const tipoInicial = this.inscripcionForm.get('tipo')?.value;
  const montoInicial = this.configService.getMontoByTipo(tipoInicial);
  this.inscripcionForm.get('montoTotal')?.setValue(montoInicial);
}
```

## Archivos a Crear/Modificar

### Crear:
- `src/app/shared/services/configuracion.service.ts`
- `src/app/shared/models/configuracion.model.ts`

### Modificar:
- `src/app/shared/services/index.ts` (agregar export)
- `src/app/shared/models/index.ts` (agregar export)
- `src/app/modules/configuracion/pages/configuracion-page/configuracion-page.component.ts`
- `src/app/modules/configuracion/pages/configuracion-page/configuracion-page.component.html`
- `src/app/modules/inscripciones/components/inscripcion-form/inscripcion-form.component.ts`

## localStorage

**Key:** `scout_inscripcion_config`

**Formato:**
```json
{
  "montoScoutArgentina": 15000,
  "montoGrupo": 5000
}
```
