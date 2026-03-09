/**
 * EducadoresListComponent Tests
 * Tests smart component behavior for educadores list view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { EducadoresListComponent } from './educadores-list.component';
import { EducadoresStateService } from '../../../services';
import { ConfirmDialogService } from '../../../../../shared';
import { RamaEnum } from '../../../../../shared/enums';
import {
  createMockEducador,
  createMockEducadoresStateService,
  createMockRouter,
  createMockConfirmDialogService,
} from '../../../testing/personas-test-utils';

describe('EducadoresListComponent', () => {
  let component: EducadoresListComponent;
  let fixture: ComponentFixture<EducadoresListComponent>;
  let mockStateService: ReturnType<typeof createMockEducadoresStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockConfirmDialog: ReturnType<typeof createMockConfirmDialogService>;

  beforeEach(async () => {
    mockStateService = createMockEducadoresStateService();
    mockRouter = createMockRouter();
    mockConfirmDialog = createMockConfirmDialogService();

    await TestBed.configureTestingModule({
      imports: [EducadoresListComponent],
      providers: [
        { provide: EducadoresStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EducadoresListComponent);
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
      expect(component.educadores).toBe(mockStateService.educadores);
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
      const filter = { search: 'María', rama: RamaEnum.UNIDAD };

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
      const filter = { search: '', rama: RamaEnum.CAMINANTES };

      component.onFilterChange(filter);

      expect(consoleSpy).toHaveBeenCalledWith('Filter changed:', filter);
      consoleSpy.mockRestore();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to create page on onCreate', () => {
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores/crear']);
    });

    it('should navigate to edit page with id on onEdit', () => {
      const id = '123';

      component.onEdit(id);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', id, 'editar']);
    });

    it('should navigate to detail page with id on onSelect', () => {
      const id = '456';

      component.onSelect(id);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', id]);
    });
  });

  describe('Delete Action', () => {
    it('should delete educador when user confirms deletion', (done) => {
      const id = '789';
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete(id);

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('educador');
        expect(mockStateService.delete).toHaveBeenCalledWith(id);
        done();
      }, 10);
    });

    it('should NOT delete educador when user cancels deletion', (done) => {
      const id = '999';
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete(id);

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('educador');
        expect(mockStateService.delete).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should call confirmDelete with correct entity name', () => {
      const id = '111';

      component.onDelete(id);

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('educador');
    });
  });

  describe('Signal Reactivity', () => {
    it('should expose educadores signal from state service', () => {
      const mockEducadores = [createMockEducador(), createMockEducador({ id: '2' })];
      mockStateService.educadores.set(mockEducadores);
      TestBed.flushEffects();

      const result = component.educadores();

      expect(result).toEqual(mockEducadores);
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

    it('should update educadores when state service signal changes', () => {
      const e1 = createMockEducador({ id: '1' });
      const e2 = createMockEducador({ id: '2' });

      mockStateService.educadores.set([e1]);
      TestBed.flushEffects();
      expect(component.educadores().length).toBe(1);

      mockStateService.educadores.set([e1, e2]);
      TestBed.flushEffects();
      expect(component.educadores().length).toBe(2);
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
      const errorMsg = 'Failed to load educadores';
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
    it('should handle empty educadores list', () => {
      mockStateService.educadores.set([]);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.educadores().length).toBe(0);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should handle multiple educadores', () => {
      const educadores = [
        createMockEducador({ id: '1', nombre: 'María' }),
        createMockEducador({ id: '2', nombre: 'Pedro' }),
        createMockEducador({ id: '3', nombre: 'Laura' }),
      ];
      mockStateService.educadores.set(educadores);
      TestBed.flushEffects();

      const result = component.educadores();

      expect(result.length).toBe(3);
      expect(result[0].nombre).toBe('María');
      expect(result[1].nombre).toBe('Pedro');
      expect(result[2].nombre).toBe('Laura');
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle edit with empty string id', () => {
      const id = '';

      component.onEdit(id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', id, 'editar']);
    });

    it('should handle select with empty string id', () => {
      const id = '';

      component.onSelect(id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', id]);
    });

    it('should handle multiple creates in sequence', () => {
      component.onCreate();
      component.onCreate();
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/personas/educadores/crear']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/personas/educadores/crear']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, ['/personas/educadores/crear']);
    });
  });
});
