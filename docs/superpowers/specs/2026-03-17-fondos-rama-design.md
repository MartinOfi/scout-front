# Fondos Rama Redesign Specification

## Overview

Redesign the Fondos Rama page to unify aesthetics with the rest of the cajas module, implement backend-driven filtering, and display a unified table of all rama movements.

## Requirements

### 1. KPI Cards Layout

Display 5 stat cards in a single row:

| Position | Card | CajaType Enum | Icon |
|----------|------|---------------|------|
| 1 | Total Fondos Rama | N/A (computed) | `account_balance_wallet` |
| 2 | Fondo Manada | `CajaType.RAMA_MANADA` | `pets` |
| 3 | Fondo Unidad | `CajaType.RAMA_UNIDAD` | `hiking` |
| 4 | Fondo Caminantes | `CajaType.RAMA_CAMINANTES` | `landscape` |
| 5 | Fondo Rovers | `CajaType.RAMA_ROVERS` | `explore` |

**Card Design:**
- Reuse `app-stat-card` component directly (no custom fondo-card)
- Add compact icon buttons with tooltips inside each rama card for:
  - "Registrar Movimiento" (add icon)
  - "Ver Detalles" (info icon)
- White background, 12px border-radius, subtle box-shadow
- Hover: elevation effect with translateY(-2px)
- Variant based on saldo: `success` (positive), `danger` (negative)

### 2. Movements Table

Display unified table of ALL rama movements below the KPI cards.

**Default Query:**
```
GET /movimientos?tipoCaja=rama_manada,rama_unidad,rama_caminantes,rama_rovers
```

**Table Columns:**

| Key | Header | Type | Notes |
|-----|--------|------|-------|
| `fecha` | Fecha | `date` | |
| `tipo` | Tipo | `status` | Uses TipoMovimientoEnum |
| `concepto` | Concepto | `concepto` | Uses CONCEPTO_MOVIMIENTO_LABELS |
| `descripcion` | Descripción | `text` | |
| `monto` | Monto | `number` | Currency format |
| `caja` | Caja | `text` | Shows CAJA_TYPE_LABELS[tipoCaja] |
| `responsable` | Responsable | `text` | Persona name |
| `acciones` | Acciones | `action` | View/Edit/Delete |

### 3. Filter Configuration

All filters must use enums - NO magic strings.

```typescript
import { FilterConfig, FilterType } from '@shared/components/filters/generic-filters/filter-config.model';
import { CajaType, CAJA_TYPE_LABELS } from '@shared/enums/caja.enum';
import { TipoMovimientoEnum, ConceptoMovimiento, CONCEPTO_MOVIMIENTO_LABELS } from '@shared/enums/movimiento.enum';

const filterConfigs: FilterConfig[] = [
  {
    key: 'tipo',
    type: FilterType.SELECT,
    label: 'Tipo',
    placeholder: 'Todos',
    options: [
      { value: '', label: 'Todos' },
      { value: TipoMovimientoEnum.INGRESO, label: 'Ingresos' },
      { value: TipoMovimientoEnum.EGRESO, label: 'Egresos' },
    ],
  },
  {
    key: 'tipoCaja',
    type: FilterType.MULTI_SELECT,
    label: 'Caja',
    placeholder: 'Todas las ramas',
    options: [
      { value: CajaType.RAMA_MANADA, label: CAJA_TYPE_LABELS[CajaType.RAMA_MANADA] },
      { value: CajaType.RAMA_UNIDAD, label: CAJA_TYPE_LABELS[CajaType.RAMA_UNIDAD] },
      { value: CajaType.RAMA_CAMINANTES, label: CAJA_TYPE_LABELS[CajaType.RAMA_CAMINANTES] },
      { value: CajaType.RAMA_ROVERS, label: CAJA_TYPE_LABELS[CajaType.RAMA_ROVERS] },
    ],
  },
  {
    key: 'concepto',
    type: FilterType.SELECT,
    label: 'Concepto',
    placeholder: 'Todos',
    options: [
      { value: '', label: 'Todos los conceptos' },
      ...Object.entries(CONCEPTO_MOVIMIENTO_LABELS).map(([value, label]) => ({
        value: value as ConceptoMovimiento,
        label,
      })),
    ],
  },
  {
    key: 'responsableId',
    type: FilterType.SELECT,
    label: 'Responsable',
    placeholder: 'Todos',
    options: [], // Populated dynamically from personas service
  },
  {
    key: 'fecha',
    type: FilterType.DATE_RANGE,
    label: 'Fecha',
  },
];
```

### 4. Backend Query Parameters

When filters change, query the backend with:

| Filter Key | Query Param | Example |
|------------|-------------|---------|
| `tipo` | `tipo` | `?tipo=ingreso` |
| `tipoCaja` | `tipoCaja` | `?tipoCaja=rama_manada,rama_unidad` |
| `concepto` | `concepto` | `?concepto=cuota_rama` |
| `responsableId` | `responsableId` | `?responsableId=123` |
| `fecha.start` | `fechaInicio` | `?fechaInicio=2026-01-01` |
| `fecha.end` | `fechaFin` | `?fechaFin=2026-03-17` |

**Default tipoCaja value:**
```typescript
const RAMA_CAJA_TYPES = [
  CajaType.RAMA_MANADA,
  CajaType.RAMA_UNIDAD,
  CajaType.RAMA_CAMINANTES,
  CajaType.RAMA_ROVERS,
] as const;
```

### 5. Component Structure

```
fondos-rama/
├── fondos-rama.component.ts      # Main container
├── fondos-rama.component.html    # Template
├── fondos-rama.component.scss    # Styles
└── components/
    └── rama-card-actions/        # Compact action buttons for stat-card
        ├── rama-card-actions.component.ts
        ├── rama-card-actions.component.html
        └── rama-card-actions.component.scss
```

**Note:** The existing `fondo-card` component will be replaced by `app-stat-card` with embedded `rama-card-actions`.

### 6. Styling Requirements

**Cards Row:**
```scss
.fondos-header {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.rama-card-wrapper {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
```

**Table Section:**
```scss
.movimientos-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: white;
  border-radius: 8px;
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}
```

### 7. Data Flow

1. On component init:
   - Load all rama cajas for KPI saldos
   - Load movimientos with default `tipoCaja` filter (all ramas)
   - Load personas for responsable filter options

2. On filter change:
   - Build query params from filter values
   - Call `GET /movimientos?{params}`
   - Update table data signal

3. On card action click:
   - "Registrar Movimiento": Open dialog with pre-selected caja
   - "Ver Detalles": Navigate to caja detail or open drawer

## Technical Constraints

- Use Angular signals for state management
- Use OnPush change detection
- All enums imported from `@shared/enums/`
- No hardcoded strings for filter values
- Lazy load responsable options from PersonasService

## Files to Modify

| File | Action |
|------|--------|
| `fondos-rama.component.ts` | Refactor to use stat-card, add filters, backend queries |
| `fondos-rama.component.html` | New layout with 5 cards + filters + table |
| `fondos-rama.component.scss` | Add card row and table section styles |
| `fondo-card/` | Remove or deprecate (replaced by stat-card) |
| `rama-card-actions/` | Create new component for compact action buttons |

## Acceptance Criteria

- [ ] 5 KPI cards display in single row with responsive wrap
- [ ] Cards use stat-card aesthetic (white, shadow, hover elevation)
- [ ] Compact icon buttons with tooltips in rama cards
- [ ] Table shows ALL rama movements by default
- [ ] Filters query backend (not client-side filtering)
- [ ] Filter values use enums (no magic strings)
- [ ] Responsable filter populated from personas
- [ ] tipoCaja multi-select filters by rama type
- [ ] Date range filter works correctly
- [ ] Build passes with no errors
