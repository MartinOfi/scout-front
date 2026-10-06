/**
 * PersonasDashboardComponent Tests
 * Foco: toggle "Mostrar deshabilitados" y acción Deshabilitar/Rehabilitar.
 */

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';

import { PersonasDashboardComponent } from './personas-dashboard.component';
import { PersonasStateService } from '../../services/personas-state.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { EstadoPersona, PersonaType, RamaEnum } from '../../../../shared/enums';
import { Educador, PersonaExterna, Protagonista } from '../../../../shared/models';

const crearProtagonista = (overrides: Partial<Protagonista>): Protagonista => ({
  id: 'p-1',
  nombre: 'Persona',
  tipo: PersonaType.PROTAGONISTA,
  estado: EstadoPersona.ACTIVO,
  rama: RamaEnum.MANADA,
  partidaNacimiento: true,
  dni: true,
  dniPadres: true,
  carnetObraSocial: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  deletedAt: null,
  ...overrides,
});

describe('PersonasDashboardComponent - deshabilitados', () => {
  let component: PersonasDashboardComponent;
  let fixture: ComponentFixture<PersonasDashboardComponent>;
  let mockState: {
    protagonistas: ReturnType<typeof signal<Protagonista[]>>;
    cambiarHabilitacion: ReturnType<typeof vi.fn>;
  };
  let mockConfirm: { confirm: ReturnType<typeof vi.fn> };

  const activa = crearProtagonista({ id: 'p-activa', nombre: 'Ana', rama: RamaEnum.MANADA });
  const deshabilitada = crearProtagonista({
    id: 'p-baja',
    nombre: 'Beto',
    rama: RamaEnum.MANADA,
    estado: EstadoPersona.INACTIVO,
  });

  beforeEach(async () => {
    const protagonistas = signal<Protagonista[]>([activa, deshabilitada]);
    const educadores = signal<Educador[]>([]);
    const personasExternas = signal<PersonaExterna[]>([]);
    mockState = {
      protagonistas,
      cambiarHabilitacion: vi.fn().mockReturnValue(of(deshabilitada)),
    };
    mockConfirm = { confirm: vi.fn().mockReturnValue(of(true)) };

    await TestBed.configureTestingModule({
      imports: [PersonasDashboardComponent],
      providers: [
        {
          provide: PersonasStateService,
          useValue: {
            ...mockState,
            educadores,
            personasExternas,
            allPersonas: computed(() => [...protagonistas(), ...educadores()]),
            loading: signal(false),
            error: signal<string | null>(null),
            load: vi.fn(),
            delete: vi.fn().mockReturnValue(of(undefined)),
          },
        },
        { provide: ConfirmDialogService, useValue: mockConfirm },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonasDashboardComponent);
    component = fixture.componentInstance;
  });

  const idsVisibles = (): string[] => component.filteredPersonas().map((row) => row.id);

  it('por defecto oculta a los deshabilitados', () => {
    expect(idsVisibles()).toEqual(['p-activa']);
  });

  it('con el toggle activo muestra también a los deshabilitados y la columna Estado', () => {
    component.onFilterChange({ search: '', mostrarDeshabilitados: true });

    expect(idsVisibles()).toEqual(['p-activa', 'p-baja']);
    expect(component.tableColumns().some((c) => c.key === 'estadoLabel')).toBe(true);
  });

  it('sin el toggle no muestra la columna Estado', () => {
    expect(component.tableColumns().some((c) => c.key === 'estadoLabel')).toBe(false);
  });

  it('Deshabilitar: pide confirmación y deshabilita a la persona', () => {
    const row = component.filteredPersonas()[0];

    component.onActionClick({ action: 'deshabilitar', row });

    expect(mockConfirm.confirm).toHaveBeenCalled();
    expect(mockState.cambiarHabilitacion).toHaveBeenCalledWith('p-activa', false);
  });

  it('Rehabilitar: vuelve a habilitar a un deshabilitado', () => {
    component.onFilterChange({ search: '', mostrarDeshabilitados: true });
    const row = component.filteredPersonas().find((r) => r.id === 'p-baja')!;

    component.onActionClick({ action: 'rehabilitar', row });

    expect(mockState.cambiarHabilitacion).toHaveBeenCalledWith('p-baja', true);
  });

  it('si se cancela la confirmación no cambia nada', () => {
    mockConfirm.confirm.mockReturnValue(of(false));
    const row = component.filteredPersonas()[0];

    component.onActionClick({ action: 'deshabilitar', row });

    expect(mockState.cambiarHabilitacion).not.toHaveBeenCalled();
  });

  it('cada fila ofrece solo la acción que corresponde a su estado', () => {
    component.onFilterChange({ search: '', mostrarDeshabilitados: true });
    const acciones = component.tableColumns().find((c) => c.key === 'actions')!.actions!;
    const visible = (key: string, rowId: string): boolean => {
      const action = acciones.find((a) => a.key === key)!;
      const row = component.filteredPersonas().find((r) => r.id === rowId)!;
      return typeof action.visible === 'function' ? action.visible(row) : action.visible !== false;
    };

    expect(visible('deshabilitar', 'p-activa')).toBe(true);
    expect(visible('rehabilitar', 'p-activa')).toBe(false);
    expect(visible('deshabilitar', 'p-baja')).toBe(false);
    expect(visible('rehabilitar', 'p-baja')).toBe(true);
  });

  describe('stats', () => {
    const valorDe = (titulo: string): number =>
      component.stats().find((stat) => stat.title === titulo)!.value;

    it('por defecto las cards no cuentan a los deshabilitados, igual que la tabla', () => {
      expect(valorDe('Protagonistas')).toBe(1);
      expect(valorDe('Total Activos')).toBe(1);
    });

    it('con el toggle activo las cards cuentan también a los deshabilitados', () => {
      component.onFilterChange({ search: '', mostrarDeshabilitados: true });

      expect(valorDe('Protagonistas')).toBe(2);
      expect(valorDe('Total Activos')).toBe(1);
    });
  });
});
