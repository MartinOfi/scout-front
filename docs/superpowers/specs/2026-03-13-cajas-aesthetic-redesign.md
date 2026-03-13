# Cajas Page Aesthetic Redesign

**Date:** 2026-03-13
**Status:** Approved
**Author:** Claude Code + User

## Overview

Redesign the cajas (financial management) page to fix aesthetic issues including poor contrast, inconsistent component usage, and code duplication. Replace native Material components with existing custom shared components for consistency.

## Problem Statement

The current cajas page has several issues:

1. **Native Material Tabs**: Uses `mat-tab-group` instead of the custom `ButtonTabsComponent` already available
2. **Native Buttons**: Uses `mat-raised-button` instead of `ActionButtonComponent` with consistent styling
3. **Duplicate Table Component**: `MovimientosTableComponent` duplicates functionality of the reusable `DataTableComponent`
4. **Contrast Issues**: Burgundy (#812128) backgrounds need WCAG AA compliance verification

## Design Decisions

### 1. Tab Navigation

**Change:** Replace `mat-tab-group` with `ButtonTabsComponent`

**Configuration:**
```typescript
readonly tabs: TabConfig[] = [
  { key: 'grupo', label: 'Caja de Grupo', icon: 'account_balance_wallet' },
  { key: 'rama', label: 'Fondos de Rama', icon: 'forest' },
  { key: 'personal', label: 'Cuentas Personales', icon: 'person' }
];
```

**Rationale:** ButtonTabsComponent uses the brand burgundy color for active state and provides a cohesive design with icon support.

### 2. Action Buttons

**Change:** Replace native Material buttons with `ActionButtonComponent` in a grid layout

**Actions to display:**
| Action | Icon | Variant | Purpose |
|--------|------|---------|---------|
| Registrar Ingreso | `add_circle` | success | Add income |
| Registrar Egreso | `remove_circle` | danger | Add expense |
| Ver Movimientos | `visibility` | info | View all movements |

**Layout:** Horizontal flex grid with 3 buttons, centered below the balance card.

**Rationale:** ActionButtonComponent provides consistent vertical icon+label styling with colored badges matching the design system.

### 3. Table Component Migration

**Change:** Delete `MovimientosTableComponent`, use `DataTableComponent`

**Features to enable:**
- [x] Column sorting (fecha, concepto, monto)
- [x] Pagination (10 rows per page)
- [x] Search/filter across columns
- [x] Colored status chips (Ingreso: green, Egreso: red)

**Column configuration:**
```typescript
readonly movimientosColumns: TableColumn[] = [
  { key: 'fecha', header: 'Fecha', type: 'date', sortable: true },
  { key: 'concepto', header: 'Concepto', type: 'text', sortable: true },
  { key: 'tipo', header: 'Tipo', type: 'status' },
  { key: 'monto', header: 'Monto', type: 'currency', sortable: true },
  {
    key: 'actions',
    header: 'Acciones',
    type: 'action',
    actions: [{ key: 'view', label: 'Ver', icon: 'visibility' }]
  }
];
```

**Rationale:** DataTableComponent is the standard table component with sorting, pagination, and search. Eliminates code duplication.

### 4. Contrast Fixes

**Change:** Keep burgundy (#812128) with verified WCAG-compliant white text

**Requirements:**
- Drawer header: `color: #ffffff` on `background: #812128`
- Active tab: Same color combination
- Contrast ratio: 7.2:1 (passes WCAG AAA)

**Implementation:**
- Remove `::ng-deep` from SCSS files
- Use CSS custom properties for consistent colors
- Ensure `--text-on-primary` is pure white (#ffffff)

## Files to Modify

### Delete
```
src/app/modules/cajas/components/caja-grupo/components/movimientos-table/
├── movimientos-table.component.ts
├── movimientos-table.component.html
└── movimientos-table.component.scss (if exists)
```

### Modify

| File | Changes |
|------|---------|
| `cajas-page.component.html` | Replace mat-tab-group with app-button-tabs |
| `cajas-page.component.ts` | Add tab state management, import ButtonTabsComponent |
| `cajas-page.component.scss` | Remove ::ng-deep hacks, clean up styles |
| `caja-grupo.component.html` | Replace buttons with ActionButtonComponent grid, replace table |
| `caja-grupo.component.ts` | Add table column config, remove MovimientosTableComponent import |
| `caja-drawer.component.scss` | Verify/fix contrast values |
| `fondos-rama.component.html` | Replace action buttons with ActionButtonComponent |

## Component Dependencies

**Imports needed in cajas module components:**
```typescript
import { ButtonTabsComponent, TabConfig } from '@shared/components/button-tabs';
import { ActionButtonComponent } from '@shared/components/action-button';
import { DataTableComponent, TableColumn, TableData } from '@shared/components/tables';
```

## Success Criteria

1. [ ] All tabs use ButtonTabsComponent with icons
2. [ ] All action buttons use ActionButtonComponent
3. [ ] MovimientosTableComponent deleted, DataTableComponent in use
4. [ ] Table has sorting, pagination, search, and status chips
5. [ ] No ::ng-deep in cajas SCSS files
6. [ ] Contrast ratio ≥ 4.5:1 on all text
7. [ ] Build passes with no errors
8. [ ] Visual consistency with rest of application

## Out of Scope

- Backend API changes
- New features or functionality
- Changes to other modules
- Mobile-specific optimizations (existing responsive behavior maintained)

## Risks

| Risk | Mitigation |
|------|------------|
| DataTableComponent may not support all movimientos features | Verify column types support concepto labels |
| Tab state management complexity | Use signals for reactive tab switching |
| Breaking existing functionality | Test all CRUD operations after migration |
