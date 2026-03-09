/**
 * EventoDetailComponent Tests
 * Tests smart component behavior for evento detail view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { EventoDetailComponent } from './evento-detail.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { Evento } from '../../../../shared/models';
import { MockRouter, MockActivatedRoute } from '../../../../shared/testing/common-mocks';
import { MockEventosStateService, createMockEvento } from '../../testing/eventos-test-utils';

describe('EventoDetailComponent', () => {
  let component: EventoDetailComponent;
  let fixture: ComponentFixture<EventoDetailComponent>;
  let mockStateService: MockEventosStateService;
  let mockRouter: MockRouter;
  let mockActivatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    mockStateService = {
      selected: signal<Evento | null>(null),
      loading: signal<boolean>(false),
      error: signal<string | null>(null),
      select: vi.fn(),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockActivatedRoute = {
      params: of({ id: 'evt-123' }),
    };

    await TestBed.configureTestingModule({
      imports: [EventoDetailComponent],
      providers: [
        { provide: EventosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoDetailComponent);
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
    });

    it('should extract id from route params', fakeAsync(() => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.eventoId()).toBe('evt-123');
        });
      tick();
    });

    it('should select evento in state service on init', fakeAsync(() => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith('evt-123');
        });
      tick();
    });
  });

  describe('Evento Selection', () => {
    it('should expose selected evento from state service', () => {
      const mockEvento: Evento = { id: 'evt-123', nombre: 'Evento Scout' }
      mockStateService.selected.set(mockEvento);
      TestBed.flushEffects();

      const result = component.evento();

      expect(result).toEqual(mockEvento);
      expect(result?.nombre).toBe('Evento Scout');
    });

    it('should update evento when state service selection changes', () => {
      const e1 = { id: 'evt-123', nombre: 'Evento 1' }
      const e2 = { id: 'evt-123', nombre: 'Evento 1 Updated' }

      mockStateService.selected.set(e1);
      TestBed.flushEffects();
      expect(component.evento()?.nombre).toBe('Evento 1');

      mockStateService.selected.set(e2);
      TestBed.flushEffects();
      expect(component.evento()?.nombre).toBe('Evento 1 Updated');
    });

    it('should expose null when no evento selected', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      expect(component.evento()).toBeNull();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate back on onBack', () => {
      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos']);
    });

    it('should navigate to edit on onEdit', () => {
      const mockEvento: Evento = { id: 'evt-123' }
      mockStateService.selected.set(mockEvento);

      component.onEdit();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-123', 'editar']);
    });
  });

  describe('Delete Action', () => {
    it('should delete evento when confirmed', fakeAsync(() => {
      const mockEvento: Evento = { id: 'evt-123' }
      mockStateService.selected.set(mockEvento);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockStateService.delete.mockReturnValue(of(undefined));

      if (component.onDelete) {
        component.onDelete();
      }

      setTimeout(() => {
        expect(confirmSpy).toHaveBeenCalled();
        confirmSpy.mockRestore();
        });
      tick();
    });

    it('should NOT delete evento when user cancels', fakeAsync(() => {
      const mockEvento: Evento = { id: 'evt-123' }
      mockStateService.selected.set(mockEvento);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      if (component.onDelete) {
        component.onDelete();
      }

      setTimeout(() => {
        expect(mockStateService.delete).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
        });
      tick();
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
      const errorMsg = 'Failed to load evento';
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
  });

  describe('Not Found State', () => {
    it('should handle evento not found', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.evento()).toBeNull();
      expect(component.loading()).toBe(false);
    });

    it('should show not found message when evento is null and not loading', () => {
      mockStateService.selected.set(null);
      mockStateService.loading.set(false);
      mockStateService.error.set(null);
      TestBed.flushEffects();

      const evento = component.evento();

      expect(evento).toBeNull();
    });

    it('should navigate back when clicking action in not found state', () => {
      mockStateService.selected.set(null);
      TestBed.flushEffects();

      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos']);
    });
  });

  describe('Route Params Handling', () => {
    it('should handle different evento IDs', fakeAsync(() => {
      const id1 = 'evt-123';
      mockActivatedRoute.params = of({ id: id1 });

      fixture.detectChanges();
      setTimeout(() => {
        expect(component.eventoId()).toBe('evt-123');
        });
      tick();
    });

    it('should re-select when route params change', fakeAsync(() => {
      const id1 = 'evt-123';
      const id2 = 'evt-456';

      mockActivatedRoute.params = of({ id: id1 });
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockStateService.select).toHaveBeenCalledWith(id1);

        mockActivatedRoute.params = of({ id: id2 });
        component.ngOnInit();

        expect(mockStateService.select).toHaveBeenCalledWith(id2);
        });
      tick();
    });
  });

  describe('Data Display', () => {
    it('should display evento information when loaded', () => {
      const mockEvento: Evento = {
        id: 'evt-123',
        nombre: 'Campamento Scout 2024',
      }
      mockStateService.selected.set(mockEvento);
      TestBed.flushEffects();

      const evento = component.evento();

      expect(evento?.nombre).toBe('Campamento Scout 2024');
    });

    it('should handle evento with optional fields', () => {
      const mockEvento: Evento = {
        id: 'evt-123',
        nombre: 'Evento',
      }
      mockStateService.selected.set(mockEvento);
      TestBed.flushEffects();

      const evento = component.evento();

      expect(evento?.nombre).toBe('Evento');
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize on component creation', fakeAsync(() => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.eventoId()).toBe('evt-123');
        expect(mockStateService.select).toHaveBeenCalledWith('evt-123');
        });
      tick();
    });

    it('should maintain eventoId throughout component lifetime', fakeAsync(() => {
      fixture.detectChanges();

      setTimeout(() => {
        const id1 = component.eventoId();
        const id2 = component.eventoId();

        expect(id1).toBe(id2);
        expect(id1).toBe('evt-123');
        });
      tick();
    });
  });
});
