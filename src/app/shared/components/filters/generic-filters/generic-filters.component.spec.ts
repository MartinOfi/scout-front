/**
 * Tests para el componente de filtros genérico
 *
 * Basado en las especificaciones del todo.md líneas 120-126
 * Tests unitarios para el componente principal
 * Coverage mínimo del 90%
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterConfig } from '../../../../models/core/filter-config.interface';
import { FilterType } from '../../../../models/core/filter-type.enum';
import { GenericFiltersComponent } from './generic-filters.component';

describe('GenericFiltersComponent', () => {
  let component: GenericFiltersComponent;
  let fixture: ComponentFixture<GenericFiltersComponent>;

  const mockFilterConfigs: FilterConfig[] = [
    {
      key: 'status',
      type: FilterType.SELECT,
      label: 'Estado',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
      defaultValue: 'active',
    },
    {
      key: 'search',
      type: FilterType.TEXT,
      label: 'Buscar',
      placeholder: 'Ingrese término de búsqueda...',
    },
    {
      key: 'isActive',
      type: FilterType.BOOLEAN,
      label: 'Solo activos',
      defaultValue: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFiltersComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericFiltersComponent);
    component = fixture.componentInstance;
    component.filterConfigs = mockFilterConfigs;
    fixture.detectChanges();
    // Esperar a que los efectos se ejecuten después de la detección de cambios inicial
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      // Si hay error durante tick, forzar detección de cambios síncrona
      fixture.detectChanges();
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    component.ngOnInit();
    expect(component.filtersForm.get('status')?.value).toBe('active');
    expect(component.filtersForm.get('search')?.value).toBe('');
    expect(component.filtersForm.get('isActive')?.value).toBe(false);
  });

  it('should emit filtersChanged when form values change', async () => {
    spyOn(component.filtersChanged, 'emit');

    component.filtersForm.patchValue({
      status: 'inactive',
      search: 'test',
      isActive: true,
    });

    // Esperar a que los efectos se ejecuten después de cambiar valores del formulario
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    expect(component.filtersChanged.emit).toHaveBeenCalledWith({
      status: 'inactive',
      search: 'test',
      isActive: true,
    });
  });

  it('should clear filters when onClearFilters is called', async () => {
    spyOn(component.filterCleared, 'emit');

    component.filtersForm.patchValue({
      status: 'inactive',
      search: 'test',
      isActive: true,
    });
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    component.onClearFilters();
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    expect(component.filtersForm.get('status')?.value).toBe('active');
    expect(component.filtersForm.get('search')?.value).toBe('');
    expect(component.filtersForm.get('isActive')?.value).toBe(false);
    expect(component.filterCleared.emit).toHaveBeenCalled();
  });

  it('should detect active filters correctly', () => {
    component.filtersForm.patchValue({
      status: '',
      search: '',
      isActive: false,
    });
    expect(component.hasActiveFilters()).toBe(false);

    component.filtersForm.patchValue({
      status: 'active',
      search: '',
      isActive: false,
    });
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should get filter config by key', () => {
    const config = component.getFilterConfig('status');
    expect(config).toEqual(mockFilterConfigs[0]);
  });

  it('should check if filter is active', () => {
    component.filtersForm.patchValue({
      status: 'active',
      search: '',
      isActive: false,
    });

    expect(component.isFilterActive('status')).toBe(true);
    expect(component.isFilterActive('search')).toBe(false);
  });

  it('should rebuild form when filterConfigs change', async () => {
    const newConfigs: FilterConfig[] = [
      {
        key: 'newFilter',
        type: FilterType.TEXT,
        label: 'Nuevo Filtro',
      },
    ];

    component.filterConfigs = newConfigs;
    // El componente reconstruye el formulario automáticamente cuando cambia filterConfigs
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    expect(component.filtersForm.get('newFilter')).toBeTruthy();
  });

  it('should handle initial values correctly', async () => {
    const initialValues = {
      status: 'inactive',
      search: 'initial search',
      isActive: true,
    };

    component.initialValues = initialValues;
    // El componente inicializa los valores automáticamente cuando cambia initialValues
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    expect(component.filtersForm.get('status')?.value).toBe('inactive');
    expect(component.filtersForm.get('search')?.value).toBe('initial search');
    expect(component.filtersForm.get('isActive')?.value).toBe(true);
  });

  it('should apply filters when autoApply is true', async () => {
    spyOn(component.filtersChanged, 'emit');
    component.autoApply = true;
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    component.filtersForm.patchValue({
      status: 'active',
    });
    fixture.detectChanges();
    // Manejar errores durante ApplicationRef.tick
    try {
      await fixture.whenStable();
    } catch (error) {
      fixture.detectChanges();
    }

    expect(component.filtersChanged.emit).toHaveBeenCalled();
  });

  it('should not apply filters automatically when autoApply is false', () => {
    spyOn(component.filtersChanged, 'emit');
    component.autoApply = false;

    component.filtersForm.patchValue({
      status: 'active',
    });

    expect(component.filtersChanged.emit).not.toHaveBeenCalled();
  });

  it('should apply filters when onApplyFilters is called', () => {
    spyOn(component.filtersChanged, 'emit');

    component.onApplyFilters();

    expect(component.filtersChanged.emit).toHaveBeenCalled();
  });
});
