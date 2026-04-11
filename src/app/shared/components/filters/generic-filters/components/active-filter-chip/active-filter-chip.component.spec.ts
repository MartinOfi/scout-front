import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActiveFilter } from '../../active-filter.interface';
import { FilterOperator } from '../../filter-operator.enum';
import { FilterType } from '../../filter-type.enum';
import { ActiveFilterChipComponent } from './active-filter-chip.component';

function buildFilter(override: Partial<ActiveFilter> = {}): ActiveFilter {
  return {
    key: 'search',
    type: FilterType.TEXT,
    label: 'Buscar',
    operator: FilterOperator.CONTAINS,
    value: 'Ruiz',
    ...override,
  };
}

describe('ActiveFilterChipComponent', () => {
  let fixture: ComponentFixture<ActiveFilterChipComponent>;
  let component: ActiveFilterChipComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveFilterChipComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveFilterChipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filter', buildFilter());
    fixture.detectChanges();
  });

  it('should render the filter as "Label: value"', () => {
    const text = (fixture.nativeElement as HTMLElement).querySelector('.chip__text');
    expect(text?.textContent?.trim()).toBe('Buscar: Ruiz');
  });

  it('should format an array with multiple values as "N seleccionados"', () => {
    fixture.componentRef.setInput(
      'filter',
      buildFilter({ type: FilterType.MULTI_SELECT, value: ['a', 'b', 'c'] }),
    );
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).querySelector('.chip__text');
    expect(text?.textContent?.trim()).toBe('Buscar: 3 seleccionados');
  });

  it('should format a date range as "start → end"', () => {
    fixture.componentRef.setInput(
      'filter',
      buildFilter({
        type: FilterType.DATE_RANGE,
        label: 'Creado',
        operator: FilterOperator.BETWEEN,
        value: { startDate: '2026-01-01', endDate: '2026-12-31' },
      }),
    );
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).querySelector('.chip__text');
    expect(text?.textContent?.trim()).toBe('Creado: 2026-01-01 → 2026-12-31');
  });

  it('should format a single number value correctly', () => {
    fixture.componentRef.setInput(
      'filter',
      buildFilter({
        type: FilterType.NUMBER,
        label: 'Año',
        value: 2026,
        operator: FilterOperator.IS,
      }),
    );
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).querySelector('.chip__text');
    expect(text?.textContent?.trim()).toBe('Año: 2026');
  });

  it('should emit removed when clicking the close button', () => {
    let emitted = false;
    component.removed.subscribe(() => (emitted = true));
    const removeBtn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.chip__remove',
    );
    removeBtn?.click();
    expect(emitted).toBe(true);
  });

  it('should humanize snake_case string values (replace _ with space + title case)', () => {
    fixture.componentRef.setInput(
      'filter',
      buildFilter({
        type: FilterType.SELECT,
        label: 'Tipo de deuda',
        value: 'pago_inscripcion',
        operator: FilterOperator.IS,
      }),
    );
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).querySelector('.chip__text');
    expect(text?.textContent?.trim()).toBe('Tipo de deuda: Pago Inscripcion');
  });

  it('should render a close button with an aria-label', () => {
    const removeBtn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.chip__remove',
    );
    expect(removeBtn?.getAttribute('aria-label')).toBe('Eliminar filtro Buscar');
  });
});
