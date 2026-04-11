import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CheckboxFieldComponent } from '../../../../form/checkbox-field/checkbox-field.component';
import { DateFieldComponent } from '../../../../form/date-field/date-field.component';
import { NumberFieldComponent } from '../../../../form/number-field/number-field.component';
import { SelectFieldComponent } from '../../../../form/select-field/select-field.component';
import { TextFieldComponent } from '../../../../form/text-field/text-field.component';
import { FILTER_LABELS } from '../../config/filter-labels.config';
import { FilterConfig } from '../../filter-config.interface';
import { FilterType } from '../../filter-type.enum';
import { DateRangeValue, FilterValueMap } from '../../filter-value.type';
import { hasActiveValue } from '../../utils/filter-active-state.util';
import { buildFormControlSpecs } from '../../utils/filter-form-builder.util';
import {
  buildDateRangeControlNames,
  processFormValue,
} from '../../utils/filter-value-processor.util';

const LIVE_DEBOUNCE_MS = 250;

/**
 * Dumb panel que muestra todos los filtros disponibles como inputs inline
 * y aplica los cambios en vivo (sin botón "Aplicar").
 *
 * - Pre-llena cada campo desde `initialValues`.
 * - Emite `valuesSubmitted` en cada cambio debounciado.
 * - El padre reconcilia el store: los campos vacíos se remueven del store,
 *   los no vacíos se agregan/actualizan.
 */
@Component({
  selector: 'app-filter-form-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectFieldComponent,
    TextFieldComponent,
    NumberFieldComponent,
    DateFieldComponent,
    CheckboxFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-form-panel.component.html',
  styleUrl: './filter-form-panel.component.scss',
})
export class FilterFormPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly configs = input.required<readonly FilterConfig[]>();
  readonly initialValues = input<FilterValueMap>({});

  readonly valuesSubmitted = output<FilterValueMap>();

  protected form: FormGroup = this.fb.group({});
  protected readonly labels = FILTER_LABELS;
  protected readonly filterType = FilterType;

  private liveChangesSubscription: Subscription | null = null;

  constructor() {
    // Rebuild the form whenever `configs` structurally changes.
    // `initialValues` is read via `untracked` so that updating the store
    // after the first render does not clobber what the user is typing.
    effect(() => {
      this.configs();
      untracked(() => {
        this.rebuildForm();
      });
    });
    this.destroyRef.onDestroy(() => this.liveChangesSubscription?.unsubscribe());
  }

  private rebuildForm(): void {
    this.buildForm();
    this.subscribeToLiveChanges();
  }

  private buildForm(): void {
    const specs = buildFormControlSpecs(this.configs());
    const controls: Record<string, unknown[]> = {};
    for (const spec of specs) {
      controls[spec.name] = [spec.defaultValue];
    }
    this.form = this.fb.group(controls);
    const patch = this.buildInitialPatch();
    this.form.patchValue(patch, { emitEvent: false });
  }

  private buildInitialPatch(): Record<string, unknown> {
    const initial = this.initialValues();
    const result: Record<string, unknown> = {};
    for (const config of this.configs()) {
      const raw = initial[config.key];
      if (raw === undefined) {
        continue;
      }
      if (config.type === FilterType.DATE_RANGE) {
        const range = raw as Partial<DateRangeValue>;
        const { startName, endName } = buildDateRangeControlNames(config.key);
        result[startName] = range?.startDate ?? '';
        result[endName] = range?.endDate ?? '';
        continue;
      }
      result[config.key] = raw;
    }
    return result;
  }

  private subscribeToLiveChanges(): void {
    this.liveChangesSubscription?.unsubscribe();
    this.liveChangesSubscription = this.form.valueChanges
      .pipe(debounceTime(LIVE_DEBOUNCE_MS))
      .subscribe(() => this.emitCurrentValues());
  }

  private emitCurrentValues(): void {
    const processed = processFormValue({
      configs: this.configs(),
      formValue: this.form.value as Record<string, unknown>,
    });
    const activeOnly: Record<string, FilterValueMap[string]> = {};
    for (const [key, value] of Object.entries(processed)) {
      if (hasActiveValue(value)) {
        activeOnly[key] = value;
      }
    }
    this.valuesSubmitted.emit(activeOnly);
  }
}
