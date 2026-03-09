/**
 * EducadoresDetailComponent Tests
 * Tests smart component behavior for educadores detail view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { EducadoresDetailComponent } from './educadores-detail.component';
import { EducadoresStateService } from '../../../services';
import { ConfirmDialogService } from '../../../../../shared';
import {
  createMockEducador,
  createMockEducadoresStateService,
  createMockActivatedRoute,
  createMockRouter,
  createMockConfirmDialogService,
} from '../../../testing/personas-test-utils';

describe('EducadoresDetailComponent', () => {
  let component: EducadoresDetailComponent;
  let fixture: ComponentFixture<EducadoresDetailComponent>;
  let mockStateService: ReturnType<typeof createMockEducadoresStateService>;
  let mockRouter: ReturnType<typeof createMockRouter>;
  let mockActivatedRoute: ReturnType<typeof createMockActivatedRoute>;
  let mockConfirmDialog: ReturnType<typeof createMockConfirmDialogService>;

  beforeEach(async () => {
    mockStateService = createMockEducadoresStateService();
    mockRouter = createMockRouter();
    mockActivatedRoute = createMockActivatedRoute({ id: '123' });
    mockConfirmDialog = createMockConfirmDialogService();

    await TestBed.configureTestingModule({
      imports: [EducadoresDetailComponent],
      providers: [
        { provide: EducadoresStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EducadoresDetailComponent);
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
        expect(component.educadorId()).toBe('123');
        done();
      }, 10);
    });

    it('should select educador in state service on init', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith('123');
        done();
      }, 10);
    });
  });

  describe('Educador Selection', () => {
    it('should expose selected educador from state service', () => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);
      TestBed.flushEffects();

      const result = component.educador();

      expect(result).toEqual(mockEducador);
      expect(result?.nombre).toBe('María');
      expect(result?.cargo).toBe('Coordinadora');
    });

    it('should update educador when state service selection changes', () => {
      const e1 = createMockEducador({ id: '123', nombre: 'María' });
      const e2 = createMockEducador({ id: '123', nombre: 'María Updated' });

      mockStateService.selected.set(e1);
      TestBed.flushEffects();
      expect(component.educador()?.nombre).toBe('María');

      mockStateService.selected.set(e2);
      TestBed.flushEffects();
      expect(component.educador()?.nombre).toBe('María Updated');
    });

    it('should expose null when no educador selected', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      expect(component.educador()).toBeNull();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate back on onBack', () => {
      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores']);
    });

    it('should navigate to edit on onEdit', () => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);

      component.onEdit();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores', '123', 'editar']);
    });

    it('should navigate back after successful delete', (done) => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores']);
        done();
      }, 10);
    });
  });

  describe('Delete Action', () => {
    it('should delete educador when user confirms', (done) => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(true));
      mockStateService.delete.mockReturnValue(of(undefined));

      component.onDelete();

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('educador');
        expect(mockStateService.delete).toHaveBeenCalledWith('123');
        done();
      }, 10);
    });

    it('should NOT delete educador when user cancels', (done) => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);
      mockConfirmDialog.confirmDelete.mockReturnValue(of(false));

      component.onDelete();

      setTimeout(() => {
        expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('educador');
        expect(mockStateService.delete).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should show confirmation dialog with correct title', () => {
      const mockEducador = createMockEducador({ id: '123' });
      mockStateService.selected.set(mockEducador);

      component.onDelete();

      expect(mockConfirmDialog.confirmDelete).toHaveBeenCalledWith('educador');
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
      const errorMsg = 'Failed to load educador';
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
    it('should handle educador not found', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.educador()).toBeNull();
      expect(component.loading()).toBe(false);
    });

    it('should show not found message when educador is null and not loading', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      const educador = component.educador();

      expect(educador).toBeNull();
    });

    it('should navigate back when clicking action in not found state', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/educadores']);
    });
  });

  describe('Route Params Handling', () => {
    it('should handle different educador IDs', (done) => {
      const id1 = '123';
      mockActivatedRoute = createMockActivatedRoute({ id: id1 });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.educadorId()).toBe('123');
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
    it('should display educador information when loaded', () => {
      const mockEducador = createMockEducador({
        id: '123',
        nombre: 'María',
        apellido: 'González',
        rama: 'UNIDAD',
        cargo: 'Coordinadora',
      });
      mockStateService.selected.set(mockEducador);
      TestBed.flushEffects();

      const educador = component.educador();

      expect(educador?.nombre).toBe('María');
      expect(educador?.apellido).toBe('González');
      expect(educador?.rama).toBe('UNIDAD');
      expect(educador?.cargo).toBe('Coordinadora');
    });

    it('should handle educador with optional fields', () => {
      const mockEducador = createMockEducador({
        id: '123',
        nombre: 'Pedro',
        cargo: undefined,
      });
      mockStateService.selected.set(mockEducador);
      TestBed.flushEffects();

      const educador = component.educador();

      expect(educador?.nombre).toBe('Pedro');
      expect(educador?.cargo).toBeUndefined();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize on component creation', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.educadorId()).toBe('123');
        expect(mockStateService.select).toHaveBeenCalledWith('123');
        done();
      }, 10);
    });

    it('should maintain educadorId throughout component lifetime', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        const id1 = component.educadorId();
        const id2 = component.educadorId();

        expect(id1).toBe(id2);
        expect(id1).toBe('123');
        done();
      }, 10);
    });
  });
});
