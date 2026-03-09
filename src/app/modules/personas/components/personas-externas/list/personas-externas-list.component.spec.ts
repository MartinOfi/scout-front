/**
 * PersonasExternasListComponent Tests
 * Tests smart component behavior for personas externas list view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { PersonasExternasListComponent } from './personas-externas-list.component';
import { PersonasExternasStateService } from '../../../services';
import { ConfirmDialogService } from '../../../../../shared';
import {
  createMockPersonaExterna,
  createMockPersonasExternasStateService,
  createMockRouter,
  createMockConfirmDialogService,
} from '../../../testing/personas-test-utils';

describe('PersonasExternasListComponent', () => {
  let component: PersonasExternasListComponent;
  let fixture: ComponentFixture<PersonasExternasListComponent>;
  let mockStateService: ReturnType<typeof createMockPersonasExternasStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockConfirmDialog: ReturnType<typeof createMockConfirmDialogService>;

  beforeEach(async () => {
    mockStateService = createMockPersonasExternasStateService();
    mockRouter = createMockRouter();
    mockConfirmDialog = createMockConfirmDialogService();

    await TestBed.configureTestingModule({
      imports: [PersonasExternasListComponent],
      providers: [
        { provide: PersonasExternasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonasExternasListComponent);
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

    it('should initialize signals from state service', () => {
      expect(component.personasExternas).toBe(mockStateService.personasExternas);
      expect(component.loading).toBe(mockStateService.loading);
      expect(component.error).toBe(mockStateService.error);
    });

    it('should call state.load() on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStateService.load).toHaveBeenCalledTimes(1);
      expect(mockStateService.load).toHaveBeenCalledWith();
    });
  });

  describe('Filter Change Handling', () => {
    it('should handle filter change with search and relacion', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filter = { search: 'Carlos', relacion: 'Padre' };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });

    it('should handle filter change with null relacion', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filter = { search: 'test', relacion: null };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });

    it('should handle filter change with empty search', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filter = { search: '', relacion: 'Madre' };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to create page on onCreate', () => {
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas/crear']);
    });

    it('should navigate to edit page with id on onEdit', () => {
      const id = '123';

      component.onEdit(id);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', id, 'editar']);
    });

    it('should navigate to detail page with id on onSelect', () => {
      const id = '456';

      component.onSelect(id);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', id]);
    });
  });

  describe('Delete Action', () => {
    it('should delete persona externa when user confirms deletion', (done) => {
      const id = '789';
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete(id);

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('persona externa');
        expect(mockStateService.delete).toHaveBeenCalledWith(id);
        done();
      }, 10);
    });

    it('should NOT delete persona externa when user cancels deletion', (done) => {
      const id = '999';
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete(id);

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('persona externa');
        expect(mockStateService.delete).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should call confirmDelete with correct entity name', () => {
      const id = '111';

      component.onDelete(id);

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('persona externa');
    });
  });

  describe('Signal Reactivity', () => {
    it('should expose personasExternas signal from state service', () => {
      const mockPersonas = [createMockPersonaExterna(), createMockPersonaExterna({ id: '2' })];
      mockStateService.personasExternas.set(mockPersonas);
      TestBed.flushEffects();

      const result = component.personasExternas();

      expect(result).toEqual(mockPersonas);
      expect(result.length).toBe(2);
    });

    it('should expose loading signal from state service', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });

    it('should expose error signal from state service', () => {
      const errorMsg = 'Network error';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();
      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();
      expect(component.error()).toBeNull();
    });

    it('should update personasExternas when state service signal changes', () => {
      const pe1 = createMockPersonaExterna({ id: '1' });
      const pe2 = createMockPersonaExterna({ id: '2' });

      mockStateService.personasExternas.set([pe1]);
      TestBed.flushEffects();
      expect(component.personasExternas().length).toBe(1);

      mockStateService.personasExternas.set([pe1, pe2]);
      TestBed.flushEffects();
      expect(component.personasExternas().length).toBe(2);
    });
  });

  describe('Error States', () => {
    it('should handle loading state', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      expect(component.loading()).toBe(true);
      expect(component.error()).toBeNull();
    });

    it('should handle error state', () => {
      const errorMsg = 'Failed to load personas externas';
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

  describe('Empty State', () => {
    it('should handle empty personasExternas list', () => {
      mockStateService.personasExternas.set([]);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.personasExternas().length).toBe(0);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should handle multiple personasExternas', () => {
      const personasExternas = [
        createMockPersonaExterna({ id: '1', nombre: 'Carlos' }),
        createMockPersonaExterna({ id: '2', nombre: 'Juan' }),
        createMockPersonaExterna({ id: '3', nombre: 'Rosa' }),
      ];
      mockStateService.personasExternas.set(personasExternas);
      TestBed.flushEffects();

      const result = component.personasExternas();

      expect(result.length).toBe(3);
      expect(result[0].nombre).toBe('Carlos');
      expect(result[1].nombre).toBe('Juan');
      expect(result[2].nombre).toBe('Rosa');
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle edit with empty string id', () => {
      const id = '';

      component.onEdit(id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', id, 'editar']);
    });

    it('should handle select with empty string id', () => {
      const id = '';

      component.onSelect(id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/externas', id]);
    });

    it('should handle multiple creates in sequence', () => {
      component.onCreate();
      component.onCreate();
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/personas/externas/crear']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/personas/externas/crear']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, ['/personas/externas/crear']);
    });
  });
});
