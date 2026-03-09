/**
 * CuentasPersonalesComponent Tests
 * Tests smart component behavior for cuentas personales view
 * Coverage target: 90%+ | TDD Pattern: RED-GREEN-REFACTOR
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';

import { CuentasPersonalesComponent } from './cuentas-personales.component';
import { CajasStateService } from '../../services/cajas-state.service';
import { PersonasStateService } from '../../../personas/services/personas-state.service';
import { Protagonista } from '../../../../shared/models';
import { PersonaType, EstadoPersona, RamaEnum } from '../../../../shared/enums';
import { MockRouter } from '../../../../shared/testing/common-mocks';

describe('CuentasPersonalesComponent', () => {
  let component: CuentasPersonalesComponent;
  let fixture: ComponentFixture<CuentasPersonalesComponent>;
  let mockCajasStateService: any; // Cajas service
  let mockPersonasStateService: any;
  let mockRouter: MockRouter;
  let mockDialog: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockDialog = {
      open: vi.fn(),
    };

    mockCajasStateService = {
      loading: signal<boolean>(false),
      movimientosPersonal: signal<Record<string, any>>({})
    };

    mockPersonasStateService = {
      protagonistas: signal<Protagonista[]>([]),
      load: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CuentasPersonalesComponent],
      providers: [
        { provide: CajasStateService, useValue: mockCajasStateService },
        { provide: PersonasStateService, useValue: mockPersonasStateService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentasPersonalesComponent);
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
      expect(component.personas).toBe(mockPersonasStateService.protagonistas);
      expect(component['router']).toBe(mockRouter);
    });

    it('should call personasState.load on ngOnInit', () => {
      component.ngOnInit();
      expect(mockPersonasStateService.load).toHaveBeenCalledTimes(1);
    });

    it('should expose loading signal from cajas state', () => {
      expect(component.loading).toBe(mockCajasStateService.loading);
    });
  });

  describe('Personas Signal Handling', () => {
    it('should expose protagonistas signal from personas state service', () => {
      const mockPersonas: Protagonista[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.MANADA,
          fechaIngreso: new Date('2024-01-01'),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          nombre: 'María',
          apellido: 'González',
          dni: '87654321',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.UNIDAD,
          fechaIngreso: new Date('2024-01-01'),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPersonasStateService.protagonistas.set(mockPersonas);
      TestBed.flushEffects();

      const result = component.personas();

      expect(result).toEqual(mockPersonas);
      expect(result.length).toBe(2);
    });

    it('should handle empty personas list', () => {
      mockPersonasStateService.protagonistas.set([]);
      TestBed.flushEffects();

      expect(component.personas().length).toBe(0);
    });

    it('should update personas when state service signal changes', () => {
      const persona1: Protagonista[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Juan Apellido',
          dni: '12345678',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.MANADA,
          fechaIngreso: new Date(),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const persona2: Protagonista[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Juan Apellido',
          dni: '12345678',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.MANADA,
          fechaIngreso: new Date(),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          nombre: 'María',
          apellido: 'María Apellido',
          dni: '12345678',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.UNIDAD,
          fechaIngreso: new Date(),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPersonasStateService.protagonistas.set(persona1 as any);
      TestBed.flushEffects();
      expect(component.personas().length).toBe(1);

      mockPersonasStateService.protagonistas.set(persona2 as any);
      TestBed.flushEffects();
      expect(component.personas().length).toBe(2);
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to movimientos with personaId filter on onVerMovimientos', () => {
      const personaId = 'persona-123';

      component.onVerMovimientos(personaId);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos'], {
        queryParams: { personaId, tipo: 'personal' },
      });
    });

    it('should navigate to nuevo movimiento with personaId on onRegistrarMovimiento', () => {
      const personaId = 'persona-456';

      component.onRegistrarMovimiento(personaId);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movimientos/nuevo'], {
        queryParams: { personaId, tipo: 'personal' },
      });
    });

    it('should navigate to persona detail on onVerDetalle', () => {
      const personaId = 'persona-789';

      component.onVerDetalle(personaId);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/personas/protagonistas', personaId]);
    });

    it('should handle multiple navigation calls in sequence', () => {
      const personaId = 'persona-123';

      component.onVerMovimientos(personaId);
      component.onRegistrarMovimiento(personaId);
      component.onVerDetalle(personaId);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Loading States', () => {
    it('should expose loading signal from cajas state service', () => {
      mockCajasStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockCajasStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });

    it('should handle loading state transitions', () => {
      mockCajasStateService.loading.set(true);
      TestBed.flushEffects();
      expect(component.loading()).toBe(true);

      mockCajasStateService.loading.set(false);
      TestBed.flushEffects();
      expect(component.loading()).toBe(false);
    });
  });

  describe('TrackBy Function', () => {
    it('should return personaId for trackBy', () => {
      const persona: Protagonista = {
        id: 'persona-123',
        nombre: 'Test',
          apellido: 'Test Apellido',
          dni: '12345678',
        tipo: PersonaType.PROTAGONISTA,
        estado: EstadoPersona.ACTIVO,
        rama: RamaEnum.MANADA,
        fechaIngreso: new Date(),
          fueBonificado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = component.trackByPersonaId(0, persona);

      expect(result).toBe('persona-123');
    });

    it('should work with different personas', () => {
      const personas = [
        { id: 'p1' } as any,
        { id: 'p2' } as any,
        { id: 'p3' } as any,
      ];

      personas.forEach((persona, index) => {
        const result = component.trackByPersonaId(index, persona);
        expect(result).toBe(persona.id);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should load personas data on initialization', fakeAsync(() => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockPersonasStateService.load).toHaveBeenCalled();
        });
      tick();
    });

    it('should maintain personas signal throughout lifecycle', () => {
      const mockPersonas: Protagonista[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Juan Apellido',
          dni: '12345678',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.MANADA,
          fechaIngreso: new Date(),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPersonasStateService.protagonistas.set(mockPersonas);
      TestBed.flushEffects();

      const personas1 = component.personas();

      mockPersonasStateService.protagonistas.set(mockPersonas);
      TestBed.flushEffects();

      const personas2 = component.personas();

      expect(personas1).toEqual(personas2);
      expect(personas1.length).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle null personas gracefully', () => {
      mockPersonasStateService.protagonistas.set(null as any);
      TestBed.flushEffects();

      // Should not throw
      const result = component.personas();
      expect(result).toBeNull();
    });

    it('should display personas even with loading state', () => {
      const mockPersonas: Protagonista[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Juan Apellido',
          dni: '12345678',
          tipo: PersonaType.PROTAGONISTA,
          estado: EstadoPersona.ACTIVO,
          rama: RamaEnum.MANADA,
          fechaIngreso: new Date(),
          fueBonificado: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCajasStateService.loading.set(true);
      mockPersonasStateService.protagonistas.set(mockPersonas);
      TestBed.flushEffects();

      expect(component.loading()).toBe(true);
      expect(component.personas().length).toBe(1);
    });
  });

  describe('Personas Iteration', () => {
    it('should handle large list of personas', () => {
      const personas: Protagonista[] = Array.from({ length: 100 }, (_, i) => ({
        id: `p${i}`,
        nombre: `Persona ${i}`,
        tipo: PersonaType.PROTAGONISTA,
        estado: EstadoPersona.ACTIVO,
        rama: RamaEnum.MANADA,
        fechaIngreso: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPersonasStateService.protagonistas.set(personas);
      TestBed.flushEffects();

      expect(component.personas().length).toBe(100);
    });

    it('should update trackBy index correctly', () => {
      const personas = Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
      } as any));

      personas.forEach((p, index) => {
        const result = component.trackByPersonaId(index, p);
        expect(result).toBe(`p${index}`);
      });
    });
  });
});
