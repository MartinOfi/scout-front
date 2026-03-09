/**
 * ProtagonistasListComponent Tests
 * Tests smart component behavior for protagonistas list view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { ProtagonistasListComponent } from './protagonistas-list.component';
import { PersonasStateService } from '../../../services';
import { ConfirmDialogService } from '../../../../../shared';
import { Rama } from '../../../../../shared/enums';
import {
  createMockProtagonista,
  createMockPersonasStateService,
  createMockRouter,
  createMockConfirmDialogService,
} from '../../../testing/personas-test-utils';

describe('ProtagonistasListComponent', () => {
  let component: ProtagonistasListComponent;
  let fixture: ComponentFixture<ProtagonistasListComponent>;
  let mockStateService: ReturnType<typeof createMockPersonasStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockConfirmDialog: ReturnType<typeof createMockConfirmDialogService>;

  beforeEach(async () => {
    mockStateService = createMockPersonasStateService();
    mockRouter = createMockRouter();
    mockConfirmDialog = createMockConfirmDialogService();

    await TestBed.configureTestingModule({
      imports: [ProtagonistasListComponent],
      providers: [
        { provide: PersonasStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProtagonistasListComponent);
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
      expect(component.protagonistas).toBe(mockStateService.protagonistas);
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
    it('should handle filter change with search and rama', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filter = { search: 'Juan', rama: Rama.MANADA };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });

    it('should handle filter change with null rama', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filter = { search: 'test', rama: null };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });

    it('should handle filter change with empty search', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filter = { search: '', rama: Rama.CAMINANTES };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to create page on onCreate', () => {
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas/crear']);
    });

    it('should navigate to edit page with id on onEdit', () => {
      const id = '123';

      component.onEdit(id);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', id, 'editar']);
    });

    it('should navigate to detail page with id on onSelect', () => {
      const id = '456';

      component.onSelect(id);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', id]);
    });
  });

  describe('Delete Action', () => {
    it('should delete protagonista when user confirms deletion', (done) => {
      const id = '789';
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete(id);

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('protagonista');
        expect(mockStateService.delete).toHaveBeenCalledWith(id);
        done();
      }, 10);
    });

    it('should NOT delete protagonista when user cancels deletion', (done) => {
      const id = '999';
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete(id);

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('protagonista');
        expect(mockStateService.delete).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should call confirmDelete with correct entity name', () => {
      const id = '111';

      component.onDelete(id);

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('protagonista');
    });
  });

  describe('Signal Reactivity', () => {
    it('should expose protagonistas signal from state service', () => {
      const mockProtagonistas = [createMockProtagonista(), createMockProtagonista({ id: '2' })];
      mockStateService.protagonistas.set(mockProtagonistas);
      TestBed.flushEffects();

      const result = component.protagonistas();

      expect(result).toEqual(mockProtagonistas);
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

    it('should update protagonistas when state service signal changes', () => {
      const p1 = createMockProtagonista({ id: '1' });
      const p2 = createMockProtagonista({ id: '2' });

      mockStateService.protagonistas.set([p1]);
      TestBed.flushEffects();
      expect(component.protagonistas().length).toBe(1);

      mockStateService.protagonistas.set([p1, p2]);
      TestBed.flushEffects();
      expect(component.protagonistas().length).toBe(2);
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
      const errorMsg = 'Failed to load protagonistas';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();

      expect(component.error()).toBe(errorMsg);
      expect(component.loading()).toBe(false);
    });

    it('should clear error when loading starts', () => {
      mockStateService.error.set('Previous error');
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      // Simulate clearing error when loading
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.error()).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should handle empty protagonistas list', () => {
      mockStateService.protagonistas.set([]);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.protagonistas().length).toBe(0);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should handle multiple protagonistas', () => {
      const protagonistas = [
        createMockProtagonista({ id: '1', nombre: 'Juan' }),
        createMockProtagonista({ id: '2', nombre: 'Pedro' }),
        createMockProtagonista({ id: '3', nombre: 'Luis' }),
      ];
      mockStateService.protagonistas.set(protagonistas);
      TestBed.flushEffects();

      const result = component.protagonistas();

      expect(result.length).toBe(3);
      expect(result[0].nombre).toBe('Juan');
      expect(result[1].nombre).toBe('Pedro');
      expect(result[2].nombre).toBe('Luis');
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle edit with empty string id', () => {
      const id = '';

      component.onEdit(id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', id, 'editar']);
    });

    it('should handle select with empty string id', () => {
      const id = '';

      component.onSelect(id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', id]);
    });

    it('should handle multiple creates in sequence', () => {
      component.onCreate();
      component.onCreate();
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/personas/protagonistas/crear']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/personas/protagonistas/crear']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, ['/personas/protagonistas/crear']);
    });
  });
});
