# Dark Mode Phase 0 — Lessons & Incidents

**Branch:** `feat/dark-mode-phase-0`
**Date:** 2026-04-14
**Related spec:** `docs/superpowers/specs/2026-04-14-dark-mode-design.md`
**Related plan:** `docs/superpowers/plans/2026-04-14-dark-mode-phase-0-foundations.md`

This document captures the bugs encountered during Phase 0 implementation and their root-cause fixes. Preserved so the context is not lost if the chat is compacted.

---

## Summary of commits on the branch

| SHA | Type | Notes |
|---|---|---|
| `803324b` | feat | Theme constants, config, token map |
| `4b1c4f0` | feat | ThemeLoggerService |
| `751bad0` | feat | ThemeStorageService (TDD, 5 specs) |
| `2bd99da` | feat | ThemeDomService (TDD, 3 specs) |
| `54fbad6` | test | Theme test helpers |
| `d16019e` | feat | ThemeService orchestrator (TDD, 6 specs) |
| `0b7ab27` | feat | Token SCSS: primitive, surface, text, border |
| `0821ddd` | feat | Token SCSS: shadow, interactive, rama, status |
| `eb2195d` | feat | Brand tokens, tokens index, Material 3 theme |
| `ee0c937` | **fix** | Preserve legacy SCSS token forwards in tokens index |
| `c333c41` | refactor | Wire Material 3 theme into styles.scss |
| `faa2ec1` | feat | Tailwind dark variant + semantic color tokens |
| `fa95ec0` | feat | Inline FOUC guard in index.html |
| `97c4409` | feat | Register ThemeService via APP_INITIALIZER |
| `6e6bea7` | chore | Mark Phase 0 complete |
| `d377bc2` | **fix** | Remove legacy `_color-tokens.scss` with stale `prefers-color-scheme` |
| `7a05580` | **fix** | Isolate theme-aware CSS rules from legacy tokens module |
| `3e09120` | **fix** | Restore burgundy submit button under Material 21 M3 |
| `bacf4ad` | **fix** | Neutralize Material system surface tokens tinted by red-palette |

---

## Incident #1 — Legacy tokens index was replaced, losing all legacy forwards

### Symptom

Task 9 (Material theme + tokens index) replaced the pre-existing `src/app/shared/styles/tokens/_index.scss` instead of merging. That index was previously forwarding the legacy SCSS variable layers (`_colors.scss`, `_radius.scss`, `_shadows.scss`, `_transitions.scss`, `_spacing.scss`) used by ~40 component stylesheets via `@use '.../tokens' as t; ... t.$brand-burgundy`.

After the replacement, components compiled but lost access to variables like `$brand-burgundy`, `$radius-lg`, `$shadow-card`, and rendering regressed in many places.

### Root cause

The subagent assigned Task 9 had no knowledge that the `tokens/` directory pre-existed with its own index, and overwrote it with the new dark-mode aggregator.

### Fix — commit `ee0c937`

Restored legacy forwards alongside the new token layers in `tokens/_index.scss`:

```scss
@forward 'colors';
@forward 'radius';
@forward 'shadows';
@forward 'transitions';
@forward 'spacing';

@forward 'primitive';
@forward 'brand';
@forward 'surface';
// ... etc
```

### Lesson

Before dispatching a subagent to create or overwrite any file, explicitly check whether it already exists and include that state in the prompt. The plan assumed a clean slate in `tokens/` but the codebase already had one.

---

## Incident #2 — Invisible text on dark-mode OS caused by legacy `@media (prefers-color-scheme: dark)`

### Symptom

On a Mac with OS in dark mode, the login page rendered with almost-invisible near-white text on a light background. The global `body` text color was `oklch(95% 0 0)` when it should have been `oklch(18% 0.01 250)` per the `[data-theme='light']` rules.

### Root cause

The pre-existing `src/app/shared/styles/_color-tokens.scss` had a block:

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: oklch(95% 0 0);
    --surface-primary: oklch(18% 0.01 250);
    // ...
  }
}
```

This was the OLD auto-dark-mode mechanism. My new token layers define the same CSS custom properties under `[data-theme='light']` and `[data-theme='dark']`, managed explicitly by `ThemeService`.

Both rules were emitted into `styles.css`. Because:
- `@media (prefers-color-scheme: dark) :root { ... }` and `[data-theme='light'] { ... }` have **equal specificity** (0,0,1,0)
- The legacy `_color-tokens.scss` was `@use`d **after** the new tokens in `styles.scss`
- Source order wins at equal specificity

…the legacy `@media` block won when the OS was in dark mode, overriding my light tokens with dark values (which read as near-white text on the light surface-page that my own tokens kept setting).

### Fix — commit `d377bc2`

Deleted `src/app/shared/styles/_color-tokens.scss` entirely. Its tokens are fully replaced by the new layer under `shared/styles/tokens/`. Removed the `@use` from `styles.scss`.

With the legacy file gone, `prefers-color-scheme` queries no longer exist in the compiled CSS and the only control over dark mode is the explicit `[data-theme]` attribute set by `ThemeService`.

Verified via `grep -c "prefers-color-scheme" dist/frontend/browser/styles-*.css` → `0`.

### Lesson

When migrating a dark-mode strategy from `@media (prefers-color-scheme)` to explicit `[data-theme]`, the legacy file MUST be removed in the same commit that introduces the new one. Leaving both causes silent conflicts that only manifest on OSes with dark preference.

---

## Incident #3 — Architectural bug: theme CSS rules duplicated inside every component chunk

### Symptom

After fixing Incident #2, login still rendered with collapsed layout (all elements stacked vertically, no split-screen, no gradient background). Inspecting the dev server showed:

- `.login-page` had `display: block` (not `flex`)
- `<app-login>` host element had NO `_nghost-*` attribute
- The `.login-page` div had NO `_ngcontent-*` attribute
- Zero stylesheets in the browser matched `.login-page`
- The compiled `LoginComponent` defineComponent had `encapsulation: 2` (None) and **no `styles` array**
- Other components (e.g. `caja-grupo`) DID have proper `styles` arrays, so it wasn't a global failure

Production build with `npm run build` had the styles correctly (`.login-page[_ngcontent-%COMP%]{display:flex;...}` present in `chunk-FHNHH3IN.js`). So the SOURCE was fine — the dev-server output was broken for specific components.

### Root cause (two bugs stacked)

**Bug A — Vite HMR did not propagate invalidation through the `@use` chain.**
When I modified `src/styles.scss`, `shared/styles/tokens/_index.scss`, and related partials, Vite's Angular plugin invalidated those files but did NOT invalidate the component stylesheets that depend on them transitively via `@use`. The cached compilation output for `login.component.scss` (and others) was never regenerated.

When Angular's compiler later serialized the component, it found no styles for it → emitted `encapsulation: 2` (optimization: set to None when there are no styles to scope) with an empty/absent `styles` array. The component rendered without ViewEncapsulation at all.

Touching `login.component.scss` directly (even without changing content) forced Vite to re-process it and the styles came back.

**Bug B — New theme tokens were forwarded inside the legacy `tokens/_index.scss`, leaking CSS rules into every component chunk.**
The new files `_primitive.scss`, `_brand.scss`, `_surface.scss`, `_text.scss`, `_border.scss`, `_shadow.scss`, `_interactive.scss`, `_rama.scss`, `_status.scss` contain top-level CSS rules:

```scss
:root { --palette-neutral-0: oklch(100% 0 0); ... }
[data-theme='light'] { --surface-page: var(--palette-neutral-50); ... }
[data-theme='dark'] { ... }
```

They were forwarded from `tokens/_index.scss`. Every component stylesheet that does `@use '.../tokens' as t` loaded this index, and Sass emitted all those CSS rules into that component's compiled CSS output. Angular's emulated encapsulation then prefixed them:

```css
[_ngcontent-%COMP%]:root { --palette-neutral-0: ...; }
[data-theme=light][_ngcontent-%COMP%] { --surface-page: ...; }
```

Both selectors are nonsense (`:root` never carries an `_ngcontent` attribute; `[data-theme='light']` is on `<html>` which also does not). The tokens only worked by coincidence when another code path defined them globally.

Every component chunk carried ~15 duplicated scoped-but-inert token rules, bloating the bundle.

### Fix — commit `7a05580`

**New file `src/app/shared/styles/tokens/_dark-mode.scss`:**

```scss
// Dark mode aggregator — loaded ONCE globally from src/styles.scss.
// Must not be imported by component stylesheets.

@forward 'primitive';
@forward 'brand';
@forward 'surface';
@forward 'text';
@forward 'border';
@forward 'shadow';
@forward 'interactive';
@forward 'rama';
@forward 'status';
```

**Updated `src/app/shared/styles/tokens/_index.scss`** — now holds ONLY the legacy SCSS variable forwards that components are allowed to import:

```scss
@forward 'colors';
@forward 'radius';
@forward 'shadows';
@forward 'transitions';
@forward 'spacing';
```

**Updated `src/styles.scss`:**

```scss
@use 'app/shared/styles/tokens';              // legacy for components
@use 'app/shared/styles/tokens/dark-mode';    // theme-aware, global only
```

### Verification

- `--palette-neutral-0`, `--brand-burgundy-800`, `--surface-page`, `[data-theme=light]` count in `login` chunk: **0**
- Global `styles.css` still has 7 `[data-theme=light]` and 8 `[data-theme=dark]` blocks
- Login component chunk still has its own scoped styles (`.login-page[_ngcontent-%COMP%] { display: flex; ... }`)

### Bug A workaround

Bug A (Vite HMR chain propagation) was **not fixed** — it is a known limitation of `@angular/build` + Vite with Sass `@use` dependencies. Workaround: when modifying any shared SCSS partial, either restart `npm start` OR touch each component file that transitively depends on the partial.

### Lesson

**SCSS files that emit top-level CSS rules (`:root`, `[data-theme='...']`, `@media`, or any non-variable selector) must never be imported by component stylesheets.** They belong in a global-only aggregator loaded exactly once from `src/styles.scss`. Component stylesheets should only consume SCSS variables, mixins, and functions — never rules.

This applies going forward: any new theme-token file we add must only be forwarded from `tokens/_dark-mode.scss`, never from `tokens/_index.scss`.

---

## Incident #4 — Submit button rendered salmon/pink instead of burgundy

### Symptom

After restoring the login layout, the `<button mat-raised-button class="submit-button">` rendered with a pale salmon background (`rgb(255, 248, 246)`) and red text (`rgb(192, 1, 0)`) instead of the scout burgundy / white it had with the old indigo-pink prebuilt theme.

The component's own SCSS had `background-color: #812128` but it was being overridden.

### Root cause

Material 21's raised button uses CSS custom properties for its container and label colors:

```css
.mat-mdc-raised-button:not(:disabled) {
  background-color: var(--mat-button-protected-container-color, var(--mat-sys-surface));
  color: var(--mat-button-protected-label-text-color, var(--mat-sys-primary));
}
```

With my new `mat.theme()` using `$red-palette` as primary, `--mat-sys-surface` resolved to `#fff8f6` (red-palette tonal surface) and `--mat-sys-primary` to `#c00100` (red). The button used those fallbacks.

The component-level `.submit-button[_ngcontent-%COMP%] { background-color: #812128 }` rule had **lower specificity** than the Material rule `.mat-mdc-raised-button:not(:disabled)` (the latter uses class + pseudo-class) and lost.

**Critical note about the token naming:** Material 21 uses `--mat-button-protected-*` (under the newer `mat-button-*` namespace), NOT the older `--mdc-protected-button-*` (MDC namespace) that appears in older Material docs and examples. My first override attempt used the MDC names and did nothing.

### Fix — commit `3e09120`

Override the correct Material 21 button tokens directly on `.submit-button` in `login.component.scss:254-263`:

```scss
.submit-button {
  --mat-button-protected-container-color: #{t.$brand-burgundy};
  --mat-button-protected-label-text-color: #{t.$surface-white};
  --mat-button-protected-state-layer-color: #{t.$surface-white};
  --mat-button-protected-hover-state-layer-opacity: 0.08;
  --mat-button-protected-focus-state-layer-opacity: 0.12;
  --mat-button-protected-pressed-state-layer-opacity: 0.16;
  --mat-button-protected-disabled-container-color: #{t.$stone-400};
  --mat-button-protected-disabled-label-text-color: #{t.$surface-white};

  // ... rest of existing styles
}
```

Setting them via CSS custom properties on the component element works because CSS custom property inheritance beats selector specificity for `var()` resolution.

### Verification

```
backgroundColor: rgb(129, 33, 40)  // #812128 scout burgundy
color: rgb(255, 255, 255)          // white
```

### Lesson

When overriding Material component colors in Material 21:

1. **Use the `--mat-button-protected-*` (or equivalent `--mat-<component>-*`) token names**, not the older `--mdc-*` ones. Verify by searching the actual Material component CSS in dev tools or `node_modules/@angular/material/.../*.mjs`.
2. Plain `background-color` on component styles will NOT win against Material's internal selectors. You must either (a) set the tokens via CSS custom properties on the same element, or (b) use selectors with equal/higher specificity than `.mat-mdc-<component>:not(:disabled)`.
3. Tokens set via CSS custom properties are the portable, theme-friendly approach.

---

## Incident #5 — Whole application background rendered pink

### Symptom

After fixing the button, the user reported that the **whole application background** had the same pink tint the button had before. The visible surfaces of any Material component (`mat-app-background` on body, `mat-card`, `mat-toolbar`, `mat-dialog`, etc.) showed the pale pink.

### Root cause

Same underlying problem as Incident #4, but at a broader scope. `mat.theme()` with `$red-palette` as primary generates ALL Material 3 system surface tokens from the red tonal palette:

```
--mat-sys-surface: #fff8f6
--mat-sys-background: #fff8f6
--mat-sys-surface-container: #f9ebe9
--mat-sys-surface-container-low: #fef1ef
--mat-sys-surface-container-high: #f3e5e4
--mat-sys-surface-container-highest: #ede0dd
--mat-sys-primary: #c00100
--mat-sys-on-surface: #201a19
```

Every Material component that reads from `--mat-sys-surface`, `--mat-sys-background`, or the `--mat-sys-surface-container-*` family rendered with a pink tint. The standard Material class `.mat-app-background` on `<body>` pulls from `--mat-sys-background`.

This was the original design mistake: choosing `$red-palette` as "closest to scout burgundy" on the spec. It is NOT closest — it leaks its hue into every surface token.

### Fix — commit `bacf4ad`

Added a second `html { ... }` block in `material-theme.scss` AFTER the `@include mat.theme(...)` call, overriding the Material system tokens with the scout semantic tokens:

```scss
html {
  @include mat.theme((
    color: (primary: mat.$red-palette, tertiary: mat.$violet-palette, theme-type: light),
    // ...
  ));
}

[data-theme='dark'] {
  @include mat.theme((... theme-type: dark ...));
}

// Scout brand override — applied after mat.theme() so source order wins
// (both selectors are `html`; equal specificity).
html {
  --mat-sys-background: var(--surface-page);
  --mat-sys-surface: var(--surface-primary);
  --mat-sys-surface-dim: var(--surface-secondary);
  --mat-sys-surface-bright: var(--surface-primary);
  --mat-sys-surface-container-lowest: var(--surface-primary);
  --mat-sys-surface-container-low: var(--surface-primary);
  --mat-sys-surface-container: var(--surface-secondary);
  --mat-sys-surface-container-high: var(--surface-tertiary);
  --mat-sys-surface-container-highest: var(--surface-tertiary);
  --mat-sys-on-background: var(--text-primary);
  --mat-sys-on-surface: var(--text-primary);
  --mat-sys-on-surface-variant: var(--text-secondary);
  --mat-sys-outline: var(--border-strong);
  --mat-sys-outline-variant: var(--border-default);
  --mat-sys-primary: var(--brand-primary);
  --mat-sys-on-primary: var(--text-on-primary);
}
```

### Key property of this fix

The override applies to `html` (both light and dark mode). The right-hand `var(--surface-page)`, `var(--surface-primary)`, etc. are themselves **theme-aware** — they resolve to different values under `[data-theme='light']` vs `[data-theme='dark']` thanks to the scout token layer.

Consequence: Material components will automatically follow dark mode when we flip the toggle in Phase 1. No extra work needed in the Material theme file for dark support.

### Verification

| Token | Before | After |
|---|---|---|
| `--mat-sys-surface` | `#fff8f6` (pink) | `oklch(100% 0 0)` (white) |
| `--mat-sys-background` | `#fff8f6` (pink) | `oklch(98% 0.002 250)` (neutral 50) |
| `--mat-sys-surface-container` | `#f9ebe9` (pink) | `oklch(96% 0.004 250)` (neutral 100) |
| `--mat-sys-on-surface` | `#201a19` | `oklch(18% 0.01 250)` |
| `--mat-sys-primary` | `#c00100` (red) | `#812128` (scout burgundy) |

### Lesson

When using a Material built-in palette (`$red-palette`, `$violet-palette`, etc.) as primary/tertiary, understand that:

1. Material 3 derives **all** system surface tokens from the primary hue via tonal transforms
2. This affects every Material component that reads `--mat-sys-surface*` (most of them)
3. Built-in palettes are NOT a "risk-minimizing" starting point unless your brand is actually close to one of them
4. The correct long-term fix is to define a proper custom palette via `mat.define-theme` with the scout brand colors
5. The pragmatic short-term fix is to override the `--mat-sys-*` tokens directly, which is what commit `bacf4ad` does

**Follow-up for later phases**: create a true custom scout palette so `mat.theme()` derives surfaces from burgundy itself, and remove the manual overrides.

---

## Process-level lesson — Vite + Angular SCSS HMR is unreliable

### Pattern observed

Throughout this phase, whenever I edited a shared SCSS file (`styles.scss`, `tokens/*`, `_form-tokens.scss`, `material-theme.scss`), the dev server's hot module reload would:

1. Recompile the changed file itself
2. **NOT** cascade the invalidation to components that depend on it via `@use`
3. Leave stale compiled output for those components: `encapsulation: 2` and empty/absent `styles` array
4. Render the components as if they had `ViewEncapsulation.None` with no styles

Production build (`npm run build`) does NOT have this issue — it fully recompiles everything from source and emits correct `_ngcontent-%COMP%` scoped rules.

### Workaround used during debugging

- **Touch the component file directly** (e.g. `touch src/app/modules/auth/login/login.component.scss`) to force Vite to re-process that specific file. Its chunk then gets rebuilt correctly.
- Touching the shared parent (e.g. `_form-tokens.scss`) does NOT propagate.
- For broad changes, the only reliable fix is to **restart `npm start`**.

### Recommended workflow for future phases

After any commit that touches files under `src/styles.scss`, `src/app/shared/styles/`, `src/app/shared/components/form/_form-tokens.scss`, or `src/tailwind.css`, **restart the dev server** before visually verifying. Do not trust HMR for shared-SCSS changes.

---

## Environment notes (important for anyone resuming this work)

- **Test runner is Vitest**, not Jasmine+Karma, despite the `jasmine-core` devDependency. `tsconfig.spec.json` declares `"types": ["vitest/globals"]`. Angular builder is `@angular/build:unit-test`.
- **Spec files use explicit include lists** in both `tsconfig.spec.json` and `angular.json` — every new spec file must be added manually to both. There is no `**/*.spec.ts` glob.
- **Test helpers use `vi.fn()` from Vitest**, not `jasmine.createSpy`. First attempt using Jasmine syntax introduced type conflicts that had to be reverted (see commit `d16019e`).
- **Material 21 exposes `$red-palette` and `$violet-palette`** from `@angular/material`. It does NOT expose `$indigo-palette` or `$blue-palette` (the docs and older examples referencing `$indigo-palette` are wrong for 21). Available: `$red, $green, $blue, $yellow, $cyan, $magenta, $orange, $chartreuse, $spring-green, $azure, $violet, $rose`.
- **Dev server runs on port 4201**, not 4200. Port 4200 is taken by a different project (`front`) also owned by the user. The scout frontend is on 4201.

---

## Current state at end of session

- **Branch:** `feat/dark-mode-phase-0`, 20 commits ahead of main, clean working tree
- **Tests:** 179/179 passing (14 new theme subsystem specs at 100% coverage)
- **Build:** `npm run build` succeeds (pre-existing SCSS budget warnings unchanged)
- **Visual:** login page matches original design — split layout, burgundy gradient, burgundy submit button, form inputs with in-place icons, neutral background
- **Dark mode infrastructure:** fully in place
  - `ThemeService` + `ThemeStorageService` + `ThemeDomService` + `ThemeLoggerService`
  - Semantic tokens under `shared/styles/tokens/`
  - Material 3 theme via `mat.theme()` with scout brand overrides
  - Tailwind `@custom-variant dark`
  - FOUC guard in `index.html`
  - `APP_INITIALIZER` wiring

**Not in Phase 0** (deferred to Phase 1+):
- User-facing theme toggle in the page header
- Migration of layout/sidebar/page-header to semantic tokens
- Migration of ~55 feature-module component stylesheets
- Custom Material palettes matching scout brand exactly (to remove the manual `--mat-sys-*` overrides)
- Axe WCAG contrast audit
- Playwright E2E theme specs
