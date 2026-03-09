/**
 * PersonasExternasDetailComponent Tests
 * Tests smart component behavior for personas externas detail view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PersonasExternasDetailComponent } from './personas-externas-detail.component';
import { PersonasExternasStateService } from '../../../services';
import { ConfirmDialogService } from '../../../../../shared';
import {
  createMockPersonaExterna,
  createMockPersonasExternasStateService,
  createMockActivatedRoute,
  createMockRouter,
  createMockConfirmDialogService,
} from '../../../testing/personas-test-utils';

describe('PersonasExternasDetailComponent', () => {
  let component: PersonasExternasDetailComponent;
  let fixture: ComponentFixture<PersonasExternasDetailComponent>;
  let mockStateService: ReturnType<typeof createMockPersonasExternasStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;
  let mockConfirmDialog: ReturnType<typeof createMockConfirmDialogService>;

  beforeEach(async () => {
    mockStateService = createMockPersonasExternasStateService();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute({ id: '123' });
    mockConfirmDialog = createMockConfirmDialogService();

    await TestBed.configureTestingModule({
      imports: [PersonasExternasDetailComponent],
      providers: [
        { provide: PersonasExternasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonasExternasDetailComponent);
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

    it('should extract id from route params', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.personaExternaId()).toBe('123');
        done();
      }, 10);
    });

    it('should select persona externa in state service on init', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith('123');
        done();
      }, 10);
    });
  });

  describe('Persona Externa Selection', () => {
    it('should expose selected persona externa from state service', () => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);
      TestBed.flushEffects();

      const result = component.personaExterna();

      expect(result).toEqual(mockPersona);
      expect(result?.nombre).toBe('Carlos');
      expect(result?.relacion).toBe('Padre');
    });

    it('should update persona externa when state service selection changes', () => {
      const pe1 = createMockPersonaExterna({ id: '123', nombre: 'Carlos' });
      const pe2 = createMockPersonaExterna({ id: '123', nombre: 'Carlos Updated' });

      mockStateService.selected.set(pe1);
      TestBed.flushEffects();
      expect(component.personaExterna()?.nombre).toBe('Carlos');

      mockStateService.selected.set(pe2);
      TestBed.flushEffects();
      expect(component.personaExterna()?.nombre).toBe('Carlos Updated');
    });

    it('should expose null when no persona externa selected', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      expect(component.personaExterna()).toBeNull();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate back on onBack', () => {
      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas']);
    });

    it('should navigate to edit on onEdit', () => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);

      component.onEdit();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', '123', 'editar']);
    });

    it('should navigate back after successful delete', (done) => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas']);
        done();
      }, 10);
    });
  });

  describe('Delete Action', () => {
    it('should delete persona externa when user confirms', (done) => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('persona externa');
        expect(mockStateService.delete).toHaveBeenCalledWith('123');
        done();
      }, 10);
    });

    it('should NOT delete persona externa when user cancels', (done) => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete();

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('persona externa');
        expect(mockStateService.delete).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should show confirmation dialog with correct title', () => {
      const mockPersona = createMockPersonaExterna({ id: '123' });
      mockStateService.selected.set(mockPersona);

      component.onDelete();

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('persona externa');
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
      const errorMsg = 'Failed to load persona externa';
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
    it('should handle persona externa not found', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.personaExterna()).toBeNull();
      expect(component.loading()).toBe(false);
    });

    it('should show not found message when persona externa is null and not loading', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      const personaExterna = component.personaExterna();

      expect(personaExterna).toBeNull();
    });

    it('should navigate back when clicking action in not found state', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas']);
    });
  });

  describe('Route Params Handling', () => {
    it('should handle different persona externa IDs', (done) => {
      const id1 = '123';
      mockActivatedRoute = createMockActivatedRoute({ id: id1 });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.personaExternaId()).toBe('123');
        done();
      }, 10);
    });

    it('should re-select when route params change', (done) => {
      const id1 = '123';
      const id2 = '456';

      mockActivatedRoute = createMockActivatedRoute({ id: id1 });
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith(id1);

        mockActivatedRoute = createMockActivatedRoute({ id: id2 });
        component.ngOnInit();

        expect(mockStateService.select).toHaveBeenCalledWith(id2);
        done();
      }, 10);
    });
  });

  describe('Data Display', () => {
    it('should display persona externa information when loaded', () => {
      const mockPersona = createMockPersonaExterna({
        id: '123',
        nombre: 'Carlos',
        apellido: 'López',
        relacion: 'Padre',
        contacto: '123456789',
      });
      mockStateService.selected.set(mockPersona);
      TestBed.flushEffects();

      const personaExterna = component.personaExterna();

      expect(personaExterna?.nombre).toBe('Carlos');
      expect(personaExterna?.apellido).toBe('López');
      expect(personaExterna?.relacion).toBe('Padre');
    });

    it('should handle persona externa with optional fields', () => {
      const mockPersona = createMockPersonaExterna({
        id: '123',
        nombre: 'Juan',
        contacto: undefined,
      });
      mockStateService.selected.set(mockPersona);
      TestBed.flushEffects();

      const personaExterna = component.personaExterna();

      expect(personaExterna?.nombre).toBe('Juan');
      expect(personaExterna?.contacto).toBeUndefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize on component creation', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.personaExternaId()).toBe('123');
        expect(mockStateService.select).toHaveBeenCalledWith('123');
        done();
      }, 10);
    });

    it('should maintain personaExternaId throughout component lifetime', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        const id1 = component.personaExternaId();
        const id2 = component.personaExternaId();

        expect(id1).toBe(id2);
        expect(id1).toBe('123');
        done();
      }, 10);
    });
  });
});
