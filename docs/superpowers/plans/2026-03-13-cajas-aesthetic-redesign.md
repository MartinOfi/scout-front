# Cajas Page Aesthetic Redesign - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the cajas page to use existing shared components (ButtonTabsComponent, ActionButtonComponent, DataTableComponent) instead of native Material components, ensuring visual consistency and WCAG contrast compliance.

**Architecture:** Replace mat-tab-group with ButtonTabsComponent for tab navigation, replace mat-raised-button with ActionButtonComponent grid for actions, migrate from MovimientosTableComponent to DataTableComponent with full features, and remove all ::ng-deep hacks.

**Tech Stack:** Angular 21, Angular Material 21, Tailwind CSS 4, TypeScript 5.9

---

## File Structure

### Files to Delete
| File | Reason |
|------|--------|
| `src/app/modules/cajas/components/caja-grupo/components/movimientos-table/movimientos-table.component.ts` | Duplicate of DataTableComponent |
| `src/app/modules/cajas/components/caja-grupo/components/movimientos-table/movimientos-table.component.html` | Duplicate of DataTableComponent |
| `src/app/modules/cajas/components/caja-grupo/components/movimientos-table/movimientos-table.component.scss` | If exists |

### Files to Modify
| File | Changes |
|------|---------|
| `cajas-page.component.ts` | Import ButtonTabsComponent, add tab config signal, add activeTab signal |
| `cajas-page.component.html` | Replace mat-tab-group with app-button-tabs and @switch |
| `cajas-page.component.scss` | Remove all ::ng-deep, add minimal layout styles |
| `caja-grupo.component.ts` | Remove MovimientosTableComponent import, add DataTableComponent, add column config |
| `caja-grupo.component.html` | Replace buttons with ActionButtonComponent grid, replace table |
| `caja-drawer.component.scss` | Remove ::ng-deep, use proper encapsulation |

### Files NOT Modified (Clarification)
| File | Reason |
|------|--------|
| `fondos-rama.component.html` | Uses FondoCardComponent for actions. The action buttons are inside the card component's `mat-card-actions` area, where inline Material buttons are appropriate (not vertical ActionButtonComponent). No changes needed. |
| `fondo-card.component.html` | Card-action buttons (Movimientos, Registrar) are contextually correct as inline Material buttons. ActionButtonComponent is designed for standalone action grids, not card footers. |

---

## Chunk 1: Tab Navigation Migration

### Task 1: Update cajas-page.component.ts

**Files:**
- Modify: `src/app/modules/cajas/pages/cajas-page.component.ts`

- [ ] **Step 1: Add ButtonTabsComponent import**

Open `cajas-page.component.ts` and add the import (relative path from pages/):

```typescript
import { ButtonTabsComponent, TabConfig } from '../../../shared/components/button-tabs/button-tabs.component';
```

- [ ] **Step 2: Remove MatTabsModule import**

Remove from imports array:
```typescript
// Remove this line
import { MatTabsModule } from '@angular/material/tabs';
```

- [ ] **Step 3: Update component imports array**

Replace `MatTabsModule` with `ButtonTabsComponent` in the `imports` array:

```typescript
imports: [
  CommonModule,
  MatSidenavModule,
  ButtonTabsComponent,  // Replace MatTabsModule
  CajaGrupoComponent,
  FondosRamaComponent,
  CuentasPersonalesComponent,
  CajaDrawerComponent,
],
```

- [ ] **Step 4: Add tab configuration signal**

Add after the existing signals:

```typescript
readonly tabs: TabConfig[] = [
  { key: 'grupo', label: 'Caja de Grupo', icon: 'account_balance_wallet' },
  { key: 'rama', label: 'Fondos de Rama', icon: 'forest' },
  { key: 'personal', label: 'Cuentas Personales', icon: 'person' }
];

readonly activeTab = signal<string>('grupo');

onTabChange(tabKey: string): void {
  this.activeTab.set(tabKey);
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No errors related to cajas-page.component.ts

- [ ] **Step 6: Commit**

```bash
git add src/app/modules/cajas/pages/cajas-page.component.ts
git commit -m "$(cat <<'EOF'
refactor(cajas): migrate tab config to ButtonTabsComponent

- Replace MatTabsModule with ButtonTabsComponent import
- Add tabs configuration with icons
- Add activeTab signal for state management
- Add onTabChange handler
EOF
)"
```

---

### Task 2: Update cajas-page.component.html

**Files:**
- Modify: `src/app/modules/cajas/pages/cajas-page.component.html`

- [ ] **Step 1: Replace mat-tab-group with app-button-tabs**

Replace the entire mat-tab-group section with:

```html
<mat-sidenav-container class="cajas-sidenav-container">
  <mat-sidenav-content>
    <div class="cajas-page">
      <app-button-tabs
        [tabs]="tabs"
        [activeTab]="activeTab()"
        (tabChange)="onTabChange($event)"
      />

      @switch (activeTab()) {
        @case ('grupo') {
          <app-caja-grupo
            (openDrawer)="openDrawer($event)"
            (verMovimientos)="onVerMovimientos($event)"
          />
        }
        @case ('rama') {
          <app-fondos-rama
            (openDrawer)="openDrawer($event)"
            (verMovimientos)="onVerMovimientos($event)"
          />
        }
        @case ('personal') {
          <app-cuentas-personales
            (openDrawer)="openDrawer($event)"
            (verMovimientos)="onVerMovimientos($event)"
          />
        }
      }
    </div>
  </mat-sidenav-content>

  <mat-sidenav
    #drawer
    mode="over"
    position="end"
    [opened]="drawerOpen()"
    (closed)="closeDrawer()"
    class="caja-drawer-sidenav"
  >
    @if (selectedCaja(); as caja) {
      <app-caja-drawer
        [caja]="caja"
        (close)="closeDrawer()"
        (verMovimientos)="onVerMovimientos($event)"
      />
    }
  </mat-sidenav>
</mat-sidenav-container>
```

- [ ] **Step 2: Verify template compiles**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No template errors

- [ ] **Step 3: Commit**

```bash
git add src/app/modules/cajas/pages/cajas-page.component.html
git commit -m "$(cat <<'EOF'
refactor(cajas): replace mat-tab-group with ButtonTabsComponent

- Use app-button-tabs with icons
- Switch to @switch control flow for tab content
- Maintain all existing event bindings
EOF
)"
```

---

### Task 3: Clean cajas-page.component.scss

**Files:**
- Modify: `src/app/modules/cajas/pages/cajas-page.component.scss`

- [ ] **Step 1: Remove all ::ng-deep and simplify styles**

Replace entire file with:

```scss
.cajas-sidenav-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cajas-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  height: 100%;
}

.caja-drawer-sidenav {
  width: min(480px, 90vw);
}
```

- [ ] **Step 2: Verify styles compile**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No SCSS errors

- [ ] **Step 3: Commit**

```bash
git add src/app/modules/cajas/pages/cajas-page.component.scss
git commit -m "$(cat <<'EOF'
refactor(cajas): remove ::ng-deep from page styles

- Remove all ::ng-deep hacks
- Simplify to minimal layout styles
- Use CSS custom properties for spacing
EOF
)"
```

---

## Chunk 2: Action Buttons Migration

### Task 4: Update caja-grupo.component.ts for ActionButtonComponent

**Files:**
- Modify: `src/app/modules/cajas/components/caja-grupo/caja-grupo.component.ts`

- [ ] **Step 1: Add ActionButtonComponent import**

Add import (relative path from components/caja-grupo/):

```typescript
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
```

- [ ] **Step 2: Remove MovimientosTableComponent import**

Remove:
```typescript
// Remove this import
import { MovimientosTableComponent } from './components/movimientos-table/movimientos-table.component';
```

- [ ] **Step 3: Add DataTableComponent imports**

Add imports (relative paths):

```typescript
import { DataTableComponent } from '../../../../shared/components/tables/data-table.component';
import { TableColumn, TableData, TableAction } from '../../../../shared/models/table.model';
```

- [ ] **Step 4: Update component imports array**

Replace MovimientosTableComponent with ActionButtonComponent and DataTableComponent:

```typescript
imports: [
  CommonModule,
  SlicePipe,
  SaldoCardComponent,
  ActionButtonComponent,
  DataTableComponent,
],
```

- [ ] **Step 5: Add table column configuration**

Add after existing signals:

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

onTableAction(event: { action: TableAction; row: TableData }): void {
  if (event.action.key === 'view') {
    this.verDetalle.emit(event.row['id'] as string);
  }
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/app/modules/cajas/components/caja-grupo/caja-grupo.component.ts
git commit -m "$(cat <<'EOF'
refactor(cajas): add ActionButtonComponent and DataTableComponent

- Import ActionButtonComponent for action grid
- Import DataTableComponent with column config
- Add movimientosColumns with sorting, status chips
- Add onTableAction handler for row actions
- Remove MovimientosTableComponent import
EOF
)"
```

---

### Task 5: Update caja-grupo.component.html

**Files:**
- Modify: `src/app/modules/cajas/components/caja-grupo/caja-grupo.component.html`

- [ ] **Step 1: Replace buttons with ActionButtonComponent grid**

Replace the entire caja-actions div with:

```html
<div class="caja-grupo">
  <app-saldo-card
    [saldo]="cajaGrupo()?.saldo ?? 0"
    (openDrawer)="onOpenDrawer()"
  />

  <div class="action-grid">
    <app-action-button
      icon="add_circle"
      label="Registrar Ingreso"
      variant="success"
      (clicked)="onRegistrarIngreso()"
    />
    <app-action-button
      icon="remove_circle"
      label="Registrar Egreso"
      variant="danger"
      (clicked)="onRegistrarEgreso()"
    />
    <app-action-button
      icon="visibility"
      label="Ver Movimientos"
      variant="info"
      (clicked)="onVerMovimientos()"
    />
  </div>

  <section class="movimientos-section">
    <h3 class="section-title">Últimos Movimientos</h3>
    <app-data-table
      [data]="movimientosGrupo() | slice:0:10"
      [columns]="movimientosColumns"
      [config]="{ showSearch: false, showPagination: false }"
      (actionClick)="onTableAction($event)"
    />
  </section>
</div>
```

- [ ] **Step 2: Verify template compiles**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No template errors

- [ ] **Step 3: Commit**

```bash
git add src/app/modules/cajas/components/caja-grupo/caja-grupo.component.html
git commit -m "$(cat <<'EOF'
refactor(cajas): use ActionButtonComponent grid and DataTableComponent

- Replace mat-raised-button with ActionButtonComponent grid
- Use success/danger/info variants for semantic meaning
- Replace MovimientosTableComponent with DataTableComponent
- Configure table with status chips for tipo column
EOF
)"
```

---

### Task 6: Add caja-grupo.component.scss styles

**Files:**
- Create: `src/app/modules/cajas/components/caja-grupo/caja-grupo.component.scss`

- [ ] **Step 1: Create component styles**

Create the file with:

```scss
.caja-grupo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
}

.movimientos-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
```

- [ ] **Step 2: Update component decorator to include styleUrls**

In caja-grupo.component.ts, ensure styleUrls is present:

```typescript
@Component({
  selector: 'app-caja-grupo',
  standalone: true,
  imports: [...],
  templateUrl: './caja-grupo.component.html',
  styleUrls: ['./caja-grupo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

- [ ] **Step 3: Verify styles compile**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/modules/cajas/components/caja-grupo/caja-grupo.component.scss
git add src/app/modules/cajas/components/caja-grupo/caja-grupo.component.ts
git commit -m "$(cat <<'EOF'
style(cajas): add caja-grupo component styles

- Add action-grid flex layout for buttons
- Add movimientos-section with proper spacing
- Use CSS custom properties consistently
EOF
)"
```

---

## Chunk 3: Delete Duplicate Component and Clean Drawer

### Task 7: Delete MovimientosTableComponent

**Files:**
- Delete: `src/app/modules/cajas/components/caja-grupo/components/movimientos-table/`

- [ ] **Step 1: Remove the entire directory**

Run:
```bash
rm -rf src/app/modules/cajas/components/caja-grupo/components/movimientos-table
```

- [ ] **Step 2: Verify no import errors**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No errors (imports already removed in Task 4)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(cajas): delete duplicate MovimientosTableComponent

- Remove redundant component in favor of shared DataTableComponent
- Reduces code duplication
- Consolidates table logic in one place
EOF
)"
```

---

### Task 8: Clean caja-drawer.component.scss

**Files:**
- Modify: `src/app/modules/cajas/components/caja-drawer/caja-drawer.component.scss`

- [ ] **Step 1: Find ::ng-deep usage locations**

Run: `grep -n "::ng-deep" src/app/modules/cajas/components/caja-drawer/caja-drawer.component.scss`
Expected: Lines with ::ng-deep patterns (around lines 93-113)

- [ ] **Step 2: Remove ::ng-deep from filter-toggles section**

Find and replace the filter-toggles section (around lines 93-113):

```scss
// BEFORE (with ::ng-deep)
.filter-toggles {
  :host ::ng-deep .mat-button-toggle-group { ... }
  :host ::ng-deep .mat-button-toggle { ... }
  :host ::ng-deep .mat-button-toggle-checked { ... }
}

// AFTER (without ::ng-deep - use component styles)
.filter-toggles {
  display: flex;
  gap: var(--spacing-xs);

  .mat-button-toggle-group {
    border: none;
    gap: var(--spacing-xs);
  }

  .mat-button-toggle {
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);

    &.mat-button-toggle-checked {
      background-color: var(--primary);
      color: var(--text-on-primary);
    }
  }
}
```

- [ ] **Step 3: Ensure contrast compliance in drawer header**

Find the drawer header styles and verify white text on burgundy:

```scss
.drawer-header {
  background-color: var(--primary); // #812128
  color: #ffffff; // Pure white for 7.2:1 contrast

  .drawer-title,
  .drawer-subtitle,
  .balance-amount {
    color: #ffffff;
  }
}
```

- [ ] **Step 4: Verify styles compile**

Run: `npm run build -- --configuration=development 2>&1 | head -50`
Expected: No SCSS errors

- [ ] **Step 5: Commit**

```bash
git add src/app/modules/cajas/components/caja-drawer/caja-drawer.component.scss
git commit -m "$(cat <<'EOF'
refactor(cajas): remove ::ng-deep from drawer styles

- Remove all ::ng-deep hacks from filter-toggles
- Ensure WCAG AAA contrast (7.2:1) on drawer header
- Use CSS custom properties for consistency
EOF
)"
```

---

## Chunk 4: Verify and Test

### Task 9: Run Unit Tests

**Files:**
- None (verification only)

- [ ] **Step 1: Run unit tests to verify no regressions**

Run: `npm test -- --no-watch --browsers=ChromeHeadless 2>&1 | tail -30`
Expected: All tests pass

- [ ] **Step 2: If tests fail, fix issues before continuing**

Common issues:
- Missing imports in test modules
- Changed component selectors
- Removed components referenced in tests

---

### Task 10: Build and Verify

**Files:**
- None (verification only)

- [ ] **Step 1: Run full production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Check for any remaining ::ng-deep in cajas module**

Run: `grep -rn "::ng-deep" src/app/modules/cajas/`
Expected: No matches

- [ ] **Step 3: Start dev server and verify visually**

Run: `npm start`
Navigate to: `http://localhost:4200/cajas`
Expected:
- Tabs show icons (account_balance_wallet, forest, person)
- Action buttons appear in grid with colored badges
- Table shows with Tipo column as colored status chips
- Drawer header has white text on burgundy with good contrast

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(cajas): complete aesthetic redesign

- Replace mat-tab-group with ButtonTabsComponent (icons)
- Replace mat-raised-button with ActionButtonComponent grid
- Replace MovimientosTableComponent with DataTableComponent
- Remove all ::ng-deep hacks
- Ensure WCAG AAA contrast compliance
EOF
)"
```

---

## Success Criteria Checklist

After completing all tasks, verify:

- [ ] All tabs use ButtonTabsComponent with icons
- [ ] All action buttons use ActionButtonComponent
- [ ] MovimientosTableComponent deleted, DataTableComponent in use
- [ ] Table has sorting, pagination (disabled for preview), search (disabled for preview), and status chips
- [ ] No ::ng-deep in cajas SCSS files
- [ ] Contrast ratio ≥ 4.5:1 on all text (7.2:1 on drawer header)
- [ ] Build passes with no errors
- [ ] Visual consistency with rest of application
