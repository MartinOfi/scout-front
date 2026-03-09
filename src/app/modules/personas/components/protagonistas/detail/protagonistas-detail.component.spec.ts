/**
 * ProtagonistasDetailComponent Tests
 * Tests smart component behavior for protagonistas detail view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ProtagonistasDetailComponent } from './protagonistas-detail.component';
import { PersonasStateService } from '../../../services';
import { ConfirmDialogService } from '../../../../../shared';
import {
  createMockProtagonista,
  createMockPersonasStateService,
  createMockActivatedRoute,
  createMockRouter,
  createMockConfirmDialogService,
} from '../../../testing/personas-test-utils';

describe('ProtagonistasDetailComponent', () => {
  let component: ProtagonistasDetailComponent;
  let fixture: ComponentFixture<ProtagonistasDetailComponent>;
  let mockStateService: ReturnType<typeof createMockPersonasStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;
  let mockConfirmDialog: ReturnType<typeof createMockConfirmDialogService>;

  beforeEach(async () => {
    mockStateService = createMockPersonasStateService();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute({ id: '123' });
    mockConfirmDialog = createMockConfirmDialogService();

    await TestBed.configureTestingModule({
      imports: [ProtagonistasDetailComponent],
      providers: [
        { provide: PersonasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProtagonistasDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should inject dependencies correctly', () => {
      expect(component.state).toBe(mockStateService);
      expect(component['router']).toBe(mockRouter);
      expect(component['confirmDialog']).toBe(mockConfirmDialog);
    });

    it('should extract id from route params', fakeAsync(() => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.protagonistaId()).toBe('123');
        });
      tick();
    });

    it('should select protagonista in state service on init', fakeAsync(() => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith('123');
        });
      tick();
    });
  });

  describe('Protagonista Selection', () => {
    it('should expose selected protagonista from state service', () => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.protagonistas.set([mockProtagonista]);
      mockStateService.selected.set(mockProtagonista);
      TestBed.flushEffects();

      const result = component.protagonista();

      expect(result).toEqual(mockProtagonista);
      expect(result?.nombre).toBe('Juan');
      expect(result?.rama).toBe('MANADA');
    });

    it('should update protagonista when state service selection changes', () => {
      const p1 = createMockProtagonista({ id: '123', nombre: 'Juan' });
      const p2 = createMockProtagonista({ id: '123', nombre: 'Juan Updated' });

      mockStateService.selected.set(p1);
      TestBed.flushEffects();
      expect(component.protagonista()?.nombre).toBe('Juan');

      mockStateService.selected.set(p2);
      TestBed.flushEffects();
      expect(component.protagonista()?.nombre).toBe('Juan Updated');
    });

    it('should expose null when no protagonista selected', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      expect(component.protagonista()).toBeNull();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate back on onBack', () => {
      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas']);
    });

    it('should navigate to edit on onEdit', () => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);

      component.onEdit();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', '123', 'editar']);
    });

    it('should navigate back after successful delete', fakeAsync(() => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas']);
        });
      tick();
    });
  });

  describe('Delete Action', () => {
    it('should delete protagonista when user confirms', fakeAsync(() => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('protagonista');
        expect(mockStateService.delete).toHaveBeenCalledWith('123');
        });
      tick();
    });

    it('should NOT delete protagonista when user cancels', fakeAsync(() => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete();

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('protagonista');
        expect(mockStateService.delete).not.toHaveBeenCalled();
        });
      tick();
    });

    it('should show confirmation dialog with correct title', () => {
      const mockProtagonista = createMockProtagonista({ id: '123' });
      mockStateService.selected.set(mockProtagonista);

      component.onDelete();

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('protagonista');
    });
  });

  describe('Loading and Error States', () => {
    it('should expose loading signal from state service', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });

    it('should expose error signal from state service', () => {
      const errorMsg = 'Failed to load protagonista';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();
      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();
      expect(component.error()).toBeNull();
    });

    it('should handle loading state', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      expect(component.loading()).toBe(true);
      expect(component.error()).toBeNull();
    });

    it('should handle error state', () => {
      const errorMsg = 'Network error';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();

      expect(component.error()).toBe(errorMsg);
      expect(component.loading()).toBe(false);
    });

    it('should clear error when loading starts', () => {
      mockStateService.error.set('Previous error');
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.error()).toBeNull();
    });
  });

  describe('Not Found State', () => {
    it('should handle protagonista not found', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.protagonista()).toBeNull();
      expect(component.loading()).toBe(false);
    });

    it('should show not found message when protagonista is null and not loading', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      const protagonista = component.protagonista();

      expect(protagonista).toBeNull();
    });

    it('should navigate back when clicking action in not found state', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas']);
    });
  });

  describe('Route Params Handling', () => {
    it('should handle different protagonista IDs', fakeAsync(() => {
      const id1 = '123';
      mockActivatedRoute = createMockActivatedRoute({ id: id1 });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.protagonistaId()).toBe('123');
        });
      tick();
    });

    it('should re-select when route params change', fakeAsync(() => {
      const id1 = '123';
      const id2 = '456';

      mockActivatedRoute = createMockActivatedRoute({ id: id1 });
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith(id1);

        mockActivatedRoute = createMockActivatedRoute({ id: id2 });
        component.ngOnInit();

        expect(mockStateService.select).toHaveBeenCalledWith(id2);
        });
      tick();
    });
  });

  describe('Data Display', () => {
    it('should display protagonista information when loaded', () => {
      const mockProtagonista = createMockProtagonista({
        id: '123',
        nombre: 'Juan',
        apellido: 'Pérez',
        rama: 'MANADA',
        fechaIngreso: new Date('2024-01-01'),
      });
      mockStateService.selected.set(mockProtagonista);
      TestBed.flushEffects();

      const protagonista = component.protagonista();

      expect(protagonista?.nombre).toBe('Juan');
      expect(protagonista?.apellido).toBe('Pérez');
      expect(protagonista?.rama).toBe('MANADA');
    });

    it('should handle protagonista with optional fields', () => {
      const mockProtagonista = createMockProtagonista({
        id: '123',
        nombre: 'Pedro',
        cuentaPersonalId: undefined,
      });
      mockStateService.selected.set(mockProtagonista);
      TestBed.flushEffects();

      const protagonista = component.protagonista();

      expect(protagonista?.nombre).toBe('Pedro');
      expect(protagonista?.cuentaPersonalId).toBeUndefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize on component creation', fakeAsync(() => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.protagonistaId()).toBe('123');
        expect(mockStateService.select).toHaveBeenCalledWith('123');
        });
      tick();
    });

    it('should maintain protagonistaId throughout component lifetime', fakeAsync(() => {
      fixture.detectChanges();

      setTimeout(() => {
        const id1 = component.protagonistaId();
        const id2 = component.protagonistaId();

        expect(id1).toBe(id2);
        expect(id1).toBe('123');
        });
      tick();
    });
  });

  describe('Rama Display', () => {
    it('should display rama information correctly', () => {
      const mockProtagonista = createMockProtagonista({
        id: '123',
        rama: 'MANADA',
      });
      mockStateService.selected.set(mockProtagonista);
      TestBed.flushEffects();

      const protagonista = component.protagonista();

      expect(protagonista?.rama).toBe('MANADA');
    });

    it('should handle different rama values', () => {
      const ramas = ['MANADA', 'CAMINANTES', 'UNIDAD', 'ROVER'];

      ramas.forEach((rama) => {
        const mockProtagonista = createMockProtagonista({
          id: '123',
          rama: rama as any,
        });
        mockStateService.selected.set(mockProtagonista);
        TestBed.flushEffects();

        const protagonista = component.protagonista();

        expect(protagonista?.rama).toBe(rama);
      });
    });
  });
});
