# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to Use This Guide

- Start here for project norms and conventions
- This guide provides AI agents with context about project structure, skills, and best practices
- Refer to this guide when implementing features, components, and patterns

## Overview

**Scout Frontend** is an Angular 21 financial management platform UI for a scout group. It provides dashboards, financial tracking, and administrative interfaces for managing members (protagonistas, educadores), financial accounts (cajas), movements, inscriptions, monthly fees (cuotas), camps, and events.

It uses modern Angular patterns (standalone components, functional routing guards), Tailwind CSS + Angular Material, with TypeScript strict mode enabled and modular lazy-loaded feature architecture.

| Component | Location | Tech Stack |
|-----------|----------|------------|
| Frontend | `src/` | Angular 21, TypeScript 5.9 |
| Styling | `src/styles.scss` | Tailwind CSS 4 + Angular Material 21 |
| Testing | `src/**/*.spec.ts` | Jasmine + Karma |
| Build | `angular.json` | Angular CLI 21 |

## Tech Stack

- **Language:** TypeScript 5.9 (strict mode, ES2022 target)
- **Framework:** Angular 21 with standalone components
- **UI Library:** Angular Material 21
- **Styling:** Tailwind CSS 4
- **Reactive:** RxJS 7.8 with observables and signals
- **Testing:** Jasmine + Karma
- **Routing:** Angular Router with lazy loading
- **HTTP:** HttpClient with JWT interceptors

## Available Skills

### Applicable Skills for This Project

Use these skills for detailed patterns on-demand:

| Skill | Description | When to Use |
|-------|-------------|------------|
| `typescript` | Type patterns, utility types, generics | Writing interfaces, DTOs, type utilities |
| `docs` | Documentation style guide | Writing README, feature docs |
| `commit` | Conventional commits (conventional-commits) | Creating git commits |
| `changelog` | Changelog entries (keepachangelog.com) | Adding feature/fix entries |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Committing changes | `commit` |
| Creating a git commit | `commit` |
| Add changelog entry for a PR or feature | `changelog` |
| Writing TypeScript types/interfaces | `typescript` |
| Writing documentation | `docs` |
| Creating new skills | `skill-creator` |
| After creating/modifying a skill | `skill-sync` |

## Common Commands

### Development
- `npm start` — Start development server (runs on `http://localhost:4200`)
- `npm run watch` — Build in watch mode for development
- `npm run build` — Production build
- `npm test` — Run unit tests with Karma/Jasmine
- `npm run ng -- <command>` — Run Angular CLI commands directly

### Testing
```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- --include='**/path/to/*.spec.ts'

# Run tests with code coverage
npm test -- --code-coverage
```

### Linting
- `npm run ng -- lint` — Check code with ESLint

## Architecture Overview

### Module Structure

The application follows Angular's modular pattern with **feature-based lazy-loaded modules**:

```
src/app/
├── app.ts                 # Root component
├── app.config.ts          # App configuration
├── app.routes.ts          # Route definitions with lazy loading
├── core/                  # Singleton services, guards, HTTP interceptors
│   ├── guards/            # Route guards (auth.guard.ts)
│   └── interceptors/      # HTTP interceptors (auth, error, loading)
├── shared/                # Reusable components, pipes, utilities
├── layout/                # Layout components (sidebar, page-header, layout-container)
│   ├── components/        # Layout UI components
│   ├── models/            # Layout interfaces
│   └── services/          # Layout services
└── modules/               # Feature modules (lazy-loaded)
    ├── auth/              # Login, authentication
    ├── dashboard/         # Main dashboard
    ├── personas/          # Protagonistas, Educadores, Personas Externas
    ├── cajas/             # Caja Grupo, Fondos Rama, Cuentas Personales
    ├── movimientos/       # Income/expense tracking
    ├── inscripciones/     # Scout Argentina annual inscriptions
    ├── cuotas/            # Monthly group fees
    ├── campamentos/       # Camp management
    ├── eventos/           # Sale events and group events
    ├── reportes/          # Reports generation
    └── configuracion/     # System configuration
```

### Environment Configuration

| Environment | API URL |
|-------------|---------|
| Development | `https://scout-back.up.railway.app/api/v1` |
| Production | `https://scout-back.up.railway.app/api/v1` |

### Key Patterns

#### Standalone Components (Default)
- All new components use `standalone: true`
- No `NgModule` declarations needed
- Import dependencies directly in component
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, /* other imports */],
  template: `<div>...</div>`,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {}
```

#### Lazy Loading
- Feature modules loaded on-demand via routing
- Reduces initial bundle size
- Configure in `app.routes.ts`

#### HTTP Interceptors
- **AuthInterceptor** — Attaches JWT bearer token to requests
- **ErrorInterceptor** — Global error handling
- **LoadingInterceptor** — Tracks HTTP request state globally

#### Route Guards
- `authGuard`: Verify authenticated user (functional guard)

#### Reactive Forms
- Use `FormBuilder` for complex forms
- Implement custom validators
- Use `FormArray` for dynamic fields

#### RxJS Patterns
- Use `takeUntilDestroyed()` for subscription cleanup
- Implement `OnDestroy` when needed
- Use `shareReplay()` for API caching

### Route Protection Pattern

Routes use functional guards for security:
```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./modules/dashboard/dashboard.component')
    .then(m => m.DashboardComponent),
  canActivate: [authGuard],
  data: {
    page: {
      title: 'Dashboard',
      subtitle: 'Bienvenido al Sistema de Gestión Financiera Scout'
    }
  }
}
```

### UI Framework Stack
- **Angular Material 21** — Form controls, dialogs, tables, navigation, feedback components
- **Tailwind CSS 4** — Utility-based styling

## Styling Guide

### Tailwind CSS + Angular Material

### Styling Usage Rules

**DO:**
```html
<!-- Use Tailwind utilities in class attribute -->
<div class="flex items-center gap-4 p-6 rounded-lg bg-blue-600">
  <p class="text-lg font-semibold text-white">Dashboard</p>
</div>
```

**DON'T:**
```html
<!-- Never use inline styles -->
<div style="display: flex; gap: 1rem;">...</div>

<!-- Avoid arbitrary values when possible -->
<div class="text-[24px]">...</div>
```

## Code Style & Conventions

### TypeScript

**Interfaces & Types:**
```typescript
// Use interfaces for object shapes
interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  tipo: TipoPersona;
}

// Use const for union types
const RAMAS = ['Manada', 'Unidad', 'Caminantes', 'Rovers'] as const;
type Rama = typeof RAMAS[number];

// Use utility types
type ReadonlyPersona = Readonly<Persona>;
type PersonaPreview = Pick<Persona, 'id' | 'nombre'>;
```

**Strict Mode Settings:**
- `strict: true` - All strict checks enabled
- `noImplicitAny: true` - No untyped `any`
- `noImplicitOverride: true` - Override methods must be explicit

### Components

**Naming Conventions:**
- Components: PascalCase (`DashboardComponent`)
- Selectors: kebab-case (`<app-dashboard>`)
- Files: kebab-case (`dashboard.component.ts`)
- Services: PascalCase with `Service` suffix (`AuthService`)
- Pipes: PascalCase with `Pipe` suffix (`DateFormatPipe`)
- Directives: PascalCase with `Directive` suffix (`HighlightDirective`)

### Services & Dependency Injection

**Injectable Pattern:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'  // Singleton - instantiated once
})
export class PersonasService {
  constructor(private http: HttpClient) {}

  getPersonas() {
    return this.http.get('/api/v1/personas');
  }
}
```

### Creating New Services
- Place domain services in `src/app/modules/<feature>/services/`
- Mark as injectable at root: `@Injectable({ providedIn: 'root' })`
- Inherit from RxJS patterns (Observables, BehaviorSubjects for state)

### Creating New Components
- Place feature components in `src/app/modules/<feature>/components/`
- Use standalone components (no NgModule wrapper required)
- Import shared components/pipes as needed
- Use Tailwind classes + Material components for styling

## Testing Patterns

### Jasmine + Karma

**Unit Test Structure:**
```typescript
import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const title = fixture.debugElement.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Dashboard');
  });
});
```

**Run Tests:**
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --code-coverage # Coverage report
```

## Development Tips

### State Management
Use `BehaviorSubject` for component state, `Observable` for data streams.

### HTTP Requests
Always return Observables from service methods. Let components handle subscription/unsubscription:
```typescript
// Service
getPersonas(): Observable<Persona[]> {
  return this.http.get<Persona[]>('/api/v1/personas');
}

// Component (use async pipe or takeUntilDestroyed)
personas$ = this.personasService.getPersonas();
```

### Form Handling
Use `FormBuilder` from `@angular/forms`. For validation, use standard Angular validators or custom validator functions.

### Styling
Prefer **Tailwind utility classes** for layout/spacing, **Material components** for interactive elements. Define component-specific styles in `.component.scss` files.

### Testing
- Test files colocate with source: `name.component.spec.ts` in same directory
- Use Jasmine matchers and TestBed for component tests
- Mock services with `jasmine.createSpyObj()`

## Common Gotchas

### Change Detection
- **Default:** OnPush not enabled - Angular checks all components
- **Tip:** For performance, add `changeDetection: ChangeDetectionStrategy.OnPush` to heavy components

### Subscription Cleanup
- **Must do:** Unsubscribe in `ngOnDestroy` or use `takeUntilDestroyed()`
- **Gotcha:** Memory leaks occur with unclosed subscriptions

### Module Imports
- **Issue:** Components must be imported, not declared in modules
- **Fix:** Use `imports: [Component]` in standalone components

### FormControl vs Template-driven
- **Use FormBuilder:** Complex forms with validation
- **Use Template-driven:** Simple forms with minimal logic

### Material Dialog Positioning
- **Gotcha:** Dialog inherits CSS scope from parent
- **Fix:** Use `panelClass` for custom styling

## Commit & Pull Request Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

**Scopes:** `personas`, `cajas`, `movimientos`, `inscripciones`, `cuotas`, `campamentos`, `eventos`, `dashboard`, `reportes`, `configuracion`, `shared`, `core`, `layout`, `auth`, `styles`, `config`, `docs`

**Example Commits:**
```bash
git commit -m "feat(dashboard): add financial summary cards"
git commit -m "fix(auth): handle JWT token refresh on 401 response"
git commit -m "refactor(shared): simplify form validation logic"
git commit -m "docs: update component architecture guide"
```

**Before creating a PR:**
1. Run `npm test` and ensure all tests pass
2. Run `npm run lint` and fix any violations (if configured)
3. Run `npm run build` and verify no errors
4. Update changelog and documentation if needed
5. Reference issue numbers in PR description

## Domain Model Reference

The frontend mirrors the backend domain model:

| Module | Description |
|--------|-------------|
| `personas` | Members: Protagonista (scouts), Educador (leaders), PersonaExterna (external) |
| `cajas` | Financial accounts: Grupo, Rama (branch funds), Personal |
| `movimientos` | Income/expense tracking with multiple concept types |
| `inscripciones` | Scout Argentina annual inscriptions |
| `cuotas` | Monthly group fees |
| `campamentos` | Camp management with participant payments |
| `eventos` | Sale events and group events |
| `reportes` | Financial and membership reports |
| `configuracion` | System configuration |

## Important File Locations

| File | Purpose |
|------|---------|
| `src/main.ts` | App bootstrap |
| `src/app/app.ts` | Root component |
| `src/app/app.config.ts` | App configuration (providers, interceptors) |
| `src/app/app.routes.ts` | Route definitions with lazy loading |
| `src/environments/environment.ts` | Environment configuration |
| `angular.json` | Angular CLI configuration |
| `tsconfig.json` | TypeScript configuration |

## Local Development

1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Access app: `http://localhost:4200`
4. Backend API: `https://scout-back.up.railway.app/api/v1`
