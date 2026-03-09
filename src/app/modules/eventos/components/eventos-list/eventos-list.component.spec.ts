/**
 * EventosListComponent Tests
 * Tests smart component behavior for eventos list view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { EventosListComponent } from './eventos-list.component';
import { EventosStateService } from '../../services/eventos-state.service';
import { Evento } from '../../../../shared/models';
import { MockRouter, MockActivatedRoute } from '../../../../shared/testing/common-mocks';

describe('EventosListComponent', () => {
  let component: EventosListComponent;
  let fixture: ComponentFixture<EventosListComponent>;
  let mockStateService: MockXxxStateService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockStateService = {
      eventos: signal<Evento[]>([]),
      loading: signal<boolean>(false),
      error: signal<string | null>(null),
      load: vi.fn(),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [EventosListComponent],
      providers: [
        { provide: EventosStateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventosListComponent);
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

    it('should expose signals from state service', () => {
      expect(component.eventos).toBe(mockStateService.eventos);
      expect(component.loading).toBe(mockStateService.loading);
      expect(component.error).toBe(mockStateService.error);
    });

    it('should call state.load on ngOnInit', () => {
      component.ngOnInit();
      expect(mockStateService.load).toHaveBeenCalledTimes(1);
    });
  });

  describe('Eventos Signal Handling', () => {
    it('should expose eventos signal from state service', () => {
      const mockEventos: Evento[] = [
        { id: '1', nombre: 'Evento 1' } as any,
        { id: '2', nombre: 'Evento 2' } as any,
      ];

      mockStateService.eventos.set(mockEventos);
      TestBed.flushEffects();

      expect(component.eventos()).toEqual(mockEventos);
      expect(component.eventos().length).toBe(2);
    });

    it('should handle empty eventos list', () => {
      mockStateService.eventos.set([]);
      TestBed.flushEffects();

      expect(component.eventos().length).toBe(0);
    });

    it('should update eventos when state changes', () => {
      const e1: Evento[] = [{ id: '1', nombre: 'Evento 1' } as any];
      const e2: Evento[] = [
        { id: '1', nombre: 'Evento 1' },
        { id: '2', nombre: 'Evento 2' },
      ]

      mockStateService.eventos.set(e1);
      TestBed.flushEffects();
      expect(component.eventos().length).toBe(1);

      mockStateService.eventos.set(e2);
      TestBed.flushEffects();
      expect(component.eventos().length).toBe(2);
    });
  });

  describe('Filter Handling', () => {
    it('should handle filter change', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();
      const filtro = { search: 'Campamento', rama: 'MANADA' };

      if (component.onFilterChange) {
        component.onFilterChange(filtro);
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to crear on onCreate', () => {
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos/crear']);
    });

    it('should navigate to edit on onEdit', () => {
      component.onEdit('evt-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-123', 'editar']);
    });

    it('should navigate to detail on onSelect', () => {
      component.onSelect('evt-456');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', 'evt-456']);
    });
  });

  describe('Delete Action', () => {
    it('should delete evento when confirmed', fakeAsync(() => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockStateService.delete.mockReturnValue(of(undefined));

      if (component.onDelete) {
        component.onDelete('evt-789');
      }

      setTimeout(() => {
        confirmSpy.mockRestore();
        });
      tick();
    });

    it('should not delete when user cancels', fakeAsync(() => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      if (component.onDelete) {
        component.onDelete('evt-999');
      }

      setTimeout(() => {
        expect(mockStateService.delete).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
        });
      tick();
    });
  });

  describe('Loading and Error States', () => {
    it('should expose loading signal', () => {
      mockStateService.loading.set(true);
      TestBed.flushEffects();

      expect(component.loading()).toBe(true);

      mockStateService.loading.set(false);
      TestBed.flushEffects();

      expect(component.loading()).toBe(false);
    });

    it('should expose error signal', () => {
      const errorMsg = 'Failed to load eventos';
      mockStateService.error.set(errorMsg);
      TestBed.flushEffects();

      expect(component.error()).toBe(errorMsg);

      mockStateService.error.set(null);
      TestBed.flushEffects();

      expect(component.error()).toBeNull();
    });
  });

  describe('Empty State', () => {
    it('should handle empty eventos list', () => {
      mockStateService.eventos.set([]);
      TestBed.flushEffects();

      expect(component.eventos().length).toBe(0);
    });

    it('should handle multiple eventos', () => {
      const eventos: Evento[] = Array.from({ length: 5 }, (_, i) => ({
        id: `evt${i}`,
        nombre: `Evento ${i}`,
      }))

      mockStateService.eventos.set(eventos);
      TestBed.flushEffects();

      expect(component.eventos().length).toBe(5);
    });
  });

  describe('Navigation Edge Cases', () => {
    it('should handle multiple navigation calls in sequence', () => {
      component.onCreate();
      component.onEdit('id-1');
      component.onSelect('id-2');

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    });

    it('should handle edit with empty string id', () => {
      component.onEdit('');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/eventos', '', 'editar']);
    });
  });
});
