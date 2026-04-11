import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterConfig } from './filter-config.interface';
import { FilterType } from './filter-type.enum';
import { FilterValueMap } from './filter-value.type';
import { GenericFiltersComponent } from './generic-filters.component';

describe('GenericFiltersComponent', () => {
  let fixture: ComponentFixture<GenericFiltersComponent>;
  let component: GenericFiltersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFiltersComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericFiltersComponent);
    component = fixture.componentInstance;
  });

  describe('initial hydration', () => {
    it('should hydrate the store from config.defaultValue when no initialValues are provided', () => {
      const configs: FilterConfig[] = [
        { key: 'ano', type: FilterType.SELECT, label: 'Año', defaultValue: '2026' },
        { key: 'search', type: FilterType.TEXT, label: 'Buscar', defaultValue: '' },
      ];
      component.filterConfigs = configs;
      fixture.detectChanges();

      const list = (
        component as unknown as { store: { list(): readonly { key: string; value: unknown }[] } }
      ).store.list();
      expect(list.length).toBe(1);
      expect(list[0].key).toBe('ano');
      expect(list[0].value).toBe('2026');
    });

    it('should prefer initialValues over config.defaultValue when both are present', () => {
      const configs: FilterConfig[] = [
        { key: 'ano', type: FilterType.SELECT, label: 'Año', defaultValue: '2026' },
      ];
      component.filterConfigs = configs;
      component.initialValues = { ano: '2025' };
      fixture.detectChanges();

      const list = (
        component as unknown as { store: { list(): readonly { key: string; value: unknown }[] } }
      ).store.list();
      expect(list[0].value).toBe('2025');
    });

    it('should emit filtersChanged once on initial hydration so the parent fetches data', () => {
      const configs: FilterConfig[] = [
        { key: 'ano', type: FilterType.SELECT, label: 'Año', defaultValue: '2026' },
      ];
      let emitCount = 0;
      let emitted: FilterValueMap | null = null;
      component.filtersChanged.subscribe((v) => {
        emitCount += 1;
        emitted = v;
      });
      component.filterConfigs = configs;
      fixture.detectChanges();
      fixture.detectChanges();
      expect(emitCount).toBe(1);
      expect(emitted).toEqual({ ano: '2026' });
    });

    it('should emit filtersChanged when the store is mutated after hydration', () => {
      const configs: FilterConfig[] = [
        { key: 'ano', type: FilterType.SELECT, label: 'Año', defaultValue: '2026' },
      ];
      component.filterConfigs = configs;
      fixture.detectChanges();

      let emitted: FilterValueMap | null = null;
      component.filtersChanged.subscribe((v) => (emitted = v));

      const protectedAccess = component as unknown as {
        onFormSubmitted(values: FilterValueMap): void;
      };
      protectedAccess.onFormSubmitted({ ano: '2027' });
      fixture.detectChanges();

      expect(emitted).toEqual({ ano: '2027' });
    });

    it('should NOT re-emit when reconciling with the same value (popover open scenario)', () => {
      const configs: FilterConfig[] = [
        { key: 'ano', type: FilterType.SELECT, label: 'Año', defaultValue: '2026' },
      ];
      component.filterConfigs = configs;
      fixture.detectChanges();

      let emitCount = 0;
      component.filtersChanged.subscribe(() => (emitCount += 1));

      const protectedAccess = component as unknown as {
        onFormSubmitted(values: FilterValueMap): void;
      };
      protectedAccess.onFormSubmitted({ ano: '2026' });
      fixture.detectChanges();

      expect(emitCount).toBe(0);
    });
  });

  describe('onClearFilters', () => {
    it('should emit an empty valueMap through the effect after clearing', () => {
      const configs: FilterConfig[] = [
        { key: 'ano', type: FilterType.SELECT, label: 'Año', defaultValue: '2026' },
      ];
      component.filterConfigs = configs;
      fixture.detectChanges();

      let emitted: FilterValueMap | null = null;
      component.filtersChanged.subscribe((v) => (emitted = v));

      component.onClearFilters();
      fixture.detectChanges();

      expect(emitted).toEqual({});
    });
  });
});
