# Plan: Refactorización Estética del Módulo Cajas

## Resumen Ejecutivo

El módulo `/cajas` presenta una estética "AI slop" con gradientes decorativos, grids de cards idénticas, colores hard-coded, y falta de identidad visual. Este plan propone una refactorización completa siguiendo los principios de **Impeccable Design**.

## Requisitos

1. Eliminar todos los anti-patrones de diseño AI identificados
2. Crear un sistema de tokens de diseño consistente
3. Implementar tipografía fluida y responsive
4. Establecer jerarquía visual clara
5. Mantener accesibilidad (WCAG AA)
6. Soportar tema oscuro (preparación)

## Fases de Implementación

### Fase 1: Design Tokens y Cleanup (Fundación)

**Objetivo**: Establecer la base de diseño antes de cambios visuales.

#### 1.1 Crear archivo de tokens de color
```scss
// src/app/shared/styles/_color-tokens.scss
:root {
  // Semantic colors
  --color-success: oklch(65% 0.2 145);
  --color-danger: oklch(55% 0.25 25);
  --color-warning: oklch(75% 0.15 85);

  // Rama colors (semantic, not Material)
  --color-rama-manada: oklch(72% 0.18 70);
  --color-rama-unidad: oklch(62% 0.2 145);
  --color-rama-caminantes: oklch(60% 0.2 250);
  --color-rama-rovers: oklch(55% 0.2 310);

  // Shadows
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.05);
  --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.07);
  --shadow-lg: 0 10px 15px oklch(0% 0 0 / 0.1);
}
```

#### 1.2 Crear escala tipográfica fluida
```scss
// src/app/shared/styles/_typography-scale.scss
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8rem);
  --text-sm: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  --text-base: clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
  --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-xl: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --text-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-3xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
}
```

#### 1.3 Eliminar gradientes decorativos
- `caja-drawer.component.scss:24` - Reemplazar con color sólido
- `caja-drawer.component.scss:191-198` - Usar colores semánticos
- `quick-movimiento-dialog.component.scss:186` - Simplificar

#### 1.4 Reemplazar colores hard-coded
| Archivo | Color Actual | Token Nuevo |
|---------|--------------|-------------|
| caja-drawer.scss | #9a2a33 | --color-primary-dark |
| caja-drawer.scss | #fecaca | --color-danger-light |
| caja-drawer.scss | #2e7d32 | --color-success |
| caja-drawer.scss | #c62828 | --color-danger |
| fondo-card.scss | #ff9800 | --color-rama-manada |
| fondo-card.scss | #4caf50 | --color-rama-unidad |
| fondo-card.scss | #2196f3 | --color-rama-caminantes |
| fondo-card.scss | #9c27b0 | --color-rama-rovers |

**Archivos a modificar**:
- Crear: `src/app/shared/styles/_color-tokens.scss`
- Crear: `src/app/shared/styles/_typography-scale.scss`
- Modificar: `src/styles.scss`
- Modificar: `caja-drawer.component.scss`
- Modificar: `fondo-card.component.scss`
- Modificar: `saldo-card.component.scss`
- Modificar: `quick-movimiento-dialog.component.scss`

---

### Fase 2: Drawer Redesign (Componente Principal)

**Objetivo**: Transformar caja-drawer de genérico a distintivo.

#### 2.1 Header simplificado
```scss
// De gradiente a sólido con sombra sutil
.drawer-header {
  background: var(--color-primary-burgundy);
  box-shadow: inset 0 -1px 0 oklch(0% 0 0 / 0.1);
  // Sin gradiente, sin decoración innecesaria
}
```

#### 2.2 Movimientos con jerarquía visual
```scss
// Variar estilos según monto o recencia
.movimiento-item {
  &.high-value {
    border-left: 3px solid var(--color-success);
    background: var(--color-success-subtle);
  }

  &.recent {
    font-weight: 500;
  }
}
```

#### 2.3 Footer con mejor affordance
- Botón primario más prominente
- Iconos con propósito, no decoración

#### 2.4 Empty state con CTA
```html
<div class="drawer-empty">
  <div class="empty-illustration"><!-- SVG ilustrativo --></div>
  <h3>Sin movimientos aún</h3>
  <p>Registra el primer movimiento de esta caja</p>
  <button mat-flat-button color="primary" (click)="onRegistrarMovimiento()">
    Registrar movimiento
  </button>
</div>
```

**Archivos a modificar**:
- `caja-drawer.component.html`
- `caja-drawer.component.scss`

---

### Fase 3: Cards Redesign (Fondos y Saldo)

**Objetivo**: Romper la monotonía de cards idénticas.

#### 3.1 Saldo Card - Diseño destacado
- Card principal más grande
- Tipografía fluida para el monto
- Sin hover que mueve (solo highlight)

#### 3.2 Fondo Cards - Grid asimétrico
```scss
// Layout con variación
.fondos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);

  // Primera card más prominente
  .fondo-card:first-child {
    grid-column: span 2;
    // O tamaño diferente
  }
}
```

#### 3.3 Eliminar acciones redundantes
- Quitar botones duplicados
- Click en card = acción principal
- Menú contextual para acciones secundarias

**Archivos a modificar**:
- `saldo-card.component.html`
- `saldo-card.component.scss`
- `fondo-card.component.html`
- `fondo-card.component.scss`
- `fondos-rama.component.html`

---

### Fase 4: Loading y Estados (UX)

**Objetivo**: Mejorar percepción de rendimiento.

#### 4.1 Skeleton loading
```scss
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-200) 50%,
    var(--gray-100) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

#### 4.2 Error states con retry
```html
<div class="error-state">
  <mat-icon>cloud_off</mat-icon>
  <p>No pudimos cargar los datos</p>
  <button mat-stroked-button (click)="retry()">
    <mat-icon>refresh</mat-icon>
    Reintentar
  </button>
</div>
```

**Archivos a crear/modificar**:
- Crear: `src/app/shared/components/skeleton/`
- Modificar: `caja-grupo.component.html`
- Modificar: `fondos-rama.component.html`
- Modificar: `cuentas-personales.component.html`

---

### Fase 5: Quick Movimiento Dialog (Pulido)

**Objetivo**: Simplificar y refinar el dialog.

#### 5.1 Remover elementos decorativos
- Sin gradientes en botones
- Sin box-shadows excesivos
- Formulario limpio y funcional

#### 5.2 Mejorar accesibilidad
- Focus visible más prominente
- Labels siempre visibles
- Mensajes de error claros

**Archivos a modificar**:
- `quick-movimiento-dialog.component.html`
- `quick-movimiento-dialog.component.scss`

---

### Fase 6: Responsive y Mobile (Adaptación)

**Objetivo**: Mobile-first approach.

#### 6.1 Breakpoints con container queries
```scss
.cajas-page {
  container-type: inline-size;
}

@container (max-width: 600px) {
  .fondos-grid {
    grid-template-columns: 1fr;
  }
}
```

#### 6.2 Touch targets
- Mínimo 44x44px para elementos interactivos
- Spacing adecuado para dedos

**Archivos a modificar**:
- `cajas-page.component.scss`
- Todos los components SCSS

---

## Dependencias

- **Ninguna dependencia externa nueva**
- Usar herramientas existentes: Angular Material, CSS moderno

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Regresión visual | Media | Testing visual con screenshots |
| Pérdida de funcionalidad | Baja | Tests e2e existentes |
| Tiempo excedido | Media | Priorizar fases 1-2 como MVP |

## Criterios de Éxito

1. ✅ Cero gradientes decorativos
2. ✅ Todos los colores usan tokens
3. ✅ Tipografía fluida implementada
4. ✅ Grid de fondos con jerarquía visual
5. ✅ Loading con skeletons
6. ✅ Empty states con CTAs
7. ✅ Pasa auditoría de anti-patrones AI

## Estimación por Fase

| Fase | Complejidad |
|------|-------------|
| Fase 1: Tokens | Baja |
| Fase 2: Drawer | Media |
| Fase 3: Cards | Media |
| Fase 4: Loading/Estados | Baja |
| Fase 5: Dialog | Baja |
| Fase 6: Responsive | Media |

---

**ESPERANDO CONFIRMACIÓN**: ¿Proceder con este plan? (sí/no/modificar)
