import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterConfig } from '../../filter-config.interface';
import { FilterType } from '../../filter-type.enum';
import { FilterValueMap } from '../../filter-value.type';
import { FilterFormPanelComponent } from './filter-form-panel.component';

const DEBOUNCE_MS = 250;

const mockConfigs: FilterConfig[] = [
  { key: 'search', type: FilterType.TEXT, label: 'Búsqueda' },
  { key: 'status', type: FilterType.SELECT, label: 'Estado', options: [] },
  { key: 'created', type: FilterType.DATE_RANGE, label: 'Creado' },
];

function createFixture(
  configs: readonly FilterConfig[] = mockConfigs,
  initialValues: FilterValueMap = {},
): ComponentFixture<FilterFormPanelComponent> {
  const fixture = TestBed.createComponent(FilterFormPanelComponent);
  fixture.componentRef.setInput('configs', configs);
  fixture.componentRef.setInput('initialValues', initialValues);
  fixture.detectChanges();
  return fixture;
}

describe('FilterFormPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterFormPanelComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should render one labeled field per config', () => {
    const fixture = createFixture();
    const labels = (fixture.nativeElement as HTMLElement).querySelectorAll('.form-panel__label');
    expect(labels.length).toBe(3);
  });

  it('should build form controls for scalar configs and DATE_RANGE (start+end)', () => {
    const fixture = createFixture();
    const form = (fixture.componentInstance as unknown as { form: { get(k: string): unknown } })
      .form;
    expect(form.get('search')).not.toBeNull();
    expect(form.get('status')).not.toBeNull();
    expect(form.get('createdStart')).not.toBeNull();
    expect(form.get('createdEnd')).not.toBeNull();
  });

  it('should pre-fill scalar controls from initialValues', () => {
    const fixture = createFixture(mockConfigs, { search: 'hello', status: 'active' });
    const form = (
      fixture.componentInstance as unknown as { form: { value: Record<string, unknown> } }
    ).form;
    expect(form.value['search']).toBe('hello');
    expect(form.value['status']).toBe('active');
  });

  it('should pre-fill DATE_RANGE split controls from initialValues', () => {
    const fixture = createFixture(mockConfigs, {
      created: { startDate: '2026-01-01', endDate: '2026-12-31' },
    });
    const form = (
      fixture.componentInstance as unknown as { form: { value: Record<string, unknown> } }
    ).form;
    expect(form.value['createdStart']).toBe('2026-01-01');
    expect(form.value['createdEnd']).toBe('2026-12-31');
  });

  it('should emit only active values after debounce on form change', async () => {
    vi.useFakeTimers();
    try {
      const fixture = createFixture();
      let emitted: FilterValueMap | null = null;
      fixture.componentInstance.valuesSubmitted.subscribe((v) => (emitted = v));
      (
        fixture.componentInstance as unknown as { form: { patchValue(v: object): void } }
      ).form.patchValue({ search: 'hello', status: '' });
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      expect(emitted).toEqual({ search: 'hello' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('should collapse DATE_RANGE controls into a single key with start/end on change', async () => {
    vi.useFakeTimers();
    try {
      const fixture = createFixture();
      let emitted: FilterValueMap | null = null;
      fixture.componentInstance.valuesSubmitted.subscribe((v) => (emitted = v));
      (
        fixture.componentInstance as unknown as { form: { patchValue(v: object): void } }
      ).form.patchValue({ createdStart: '2026-01-01', createdEnd: '2026-12-31' });
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      expect(emitted).toEqual({
        created: { startDate: '2026-01-01', endDate: '2026-12-31' },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('should debounce rapid changes into a single emission', async () => {
    vi.useFakeTimers();
    try {
      const fixture = createFixture();
      let emitCount = 0;
      fixture.componentInstance.valuesSubmitted.subscribe(() => (emitCount += 1));
      const form = (
        fixture.componentInstance as unknown as { form: { patchValue(v: object): void } }
      ).form;
      form.patchValue({ search: 'h' });
      await vi.advanceTimersByTimeAsync(50);
      form.patchValue({ search: 'he' });
      await vi.advanceTimersByTimeAsync(50);
      form.patchValue({ search: 'hell' });
      await vi.advanceTimersByTimeAsync(50);
      form.patchValue({ search: 'hello' });
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
      expect(emitCount).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should render an empty-state message when there are no configs', () => {
    const fixture = createFixture([]);
    const empty = (fixture.nativeElement as HTMLElement).querySelector('.form-panel__empty');
    expect(empty).not.toBeNull();
  });
});
