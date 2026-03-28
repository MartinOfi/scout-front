/**
 * PersonaSelectorDialogComponent
 * Reusable dialog for selecting personas across the application.
 * Supports filtering by type, rama, and excluding already-selected IDs.
 *
 * @example
 * // Open dialog with configuration
 * const dialogData: PersonaSelectorDialogData = {
 *   title: 'Agregar Participante',
 *   filterByTypes: [PersonaType.PROTAGONISTA, PersonaType.EDUCADOR],
 *   excludeIds: existingParticipantIds,
 * };
 * this.dialog.open(PersonaSelectorDialogComponent, { data: dialogData });
 */

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';

import { PersonaUnion } from '../../models';
import { PersonaType, Rama, RAMAS, PERSONA_TYPE_LABELS, RAMA_LABELS } from '../../enums';
import { PersonasApiService } from '../../../modules/personas/services/personas-api.service';
import { FormFieldComponent } from '../form/form-field/form-field.component';
import { SelectFieldComponent } from '../form/select-field/select-field.component';

// ============================================================================
// Public Interfaces
// ============================================================================

/**
 * Configuration data for the PersonaSelectorDialog
 */
export interface PersonaSelectorDialogData {
  /** Dialog title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Filter personas by these types (default: all active types) */
  filterByTypes?: PersonaType[];
  /** Filter personas by rama (optional) */
  filterByRama?: Rama;
  /** IDs to exclude from selection (e.g., already added participants) */
  excludeIds?: string[];
  /** Show rama filter dropdown (default: false) */
  showRamaFilter?: boolean;
  /** Custom confirm button label (default: 'Confirmar') */
  confirmLabel?: string;
}

/**
 * Result returned when a persona is selected
 */
export interface PersonaSelectorDialogResult {
  /** Selected persona */
  persona: PersonaUnion;
}

// ============================================================================
// Component
// ============================================================================

@Component({
  selector: 'app-persona-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormFieldComponent,
    SelectFieldComponent,
  ],
  templateUrl: './persona-selector-dialog.component.html',
  styleUrl: './persona-selector-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonaSelectorDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<PersonaSelectorDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly personasApi = inject(PersonasApiService);
  readonly data = inject<PersonaSelectorDialogData>(MAT_DIALOG_DATA);

  // State signals
  readonly loading = signal(false);
  readonly personas = signal<PersonaUnion[]>([]);

  // Rama filter for UI (when showRamaFilter is enabled)
  readonly selectedRama = signal<Rama | null>(this.data.filterByRama ?? null);

  // Form
  readonly form: FormGroup = this.fb.group({
    personaId: ['', Validators.required],
  });

  // Rama options for filter (spread to mutable array for select component)
  readonly ramaOptions: Rama[] = [...RAMAS];

  // Computed: filtered personas based on type, rama, and exclusions
  readonly filteredPersonas = computed((): PersonaUnion[] => {
    let result = this.personas();

    // Filter by types
    if (this.data.filterByTypes?.length) {
      result = result.filter((p) => this.data.filterByTypes!.includes(p.tipo));
    }

    // Filter by rama (from dialog data or selected in UI)
    const rama = this.selectedRama() ?? this.data.filterByRama;
    if (rama) {
      result = result.filter((p) => {
        if ('rama' in p) {
          return p.rama === rama;
        }
        return false;
      });
    }

    // Exclude already-added IDs
    if (this.data.excludeIds?.length) {
      const excludeSet = new Set(this.data.excludeIds);
      result = result.filter((p) => !excludeSet.has(p.id));
    }

    return result;
  });

  // Computed: check if form is valid
  readonly formInvalid = computed((): boolean => {
    return this.form.invalid;
  });

  // ============================================================================
  // Lifecycle
  // ============================================================================

  ngOnInit(): void {
    this.loadPersonas();
  }

  // ============================================================================
  // Data Loading
  // ============================================================================

  private loadPersonas(): void {
    this.loading.set(true);
    this.personasApi
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (personas) => this.personas.set(personas),
        error: () => this.personas.set([]),
      });
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  onRamaChange(rama: Rama | null): void {
    this.selectedRama.set(rama);
    // Reset selection when rama changes
    this.form.patchValue({ personaId: '' });
  }

  onConfirm(): void {
    if (this.form.invalid) return;

    const personaId = this.form.value.personaId;
    const persona = this.filteredPersonas().find((p) => p.id === personaId);

    if (persona) {
      const result: PersonaSelectorDialogResult = { persona };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // ============================================================================
  // Template Helpers
  // ============================================================================

  /** Get display label for a persona */
  getPersonaLabel = (persona: PersonaUnion): string => {
    const typeLabel = PERSONA_TYPE_LABELS[persona.tipo];
    let extra = '';

    if ('rama' in persona && persona.rama) {
      extra = ` - ${persona.rama}`;
    }

    return `${persona.nombre} (${typeLabel}${extra})`;
  };

  /** Get value for a persona option */
  getPersonaValue = (persona: PersonaUnion): string => {
    return persona.id;
  };

  /** Get display label for rama */
  getRamaLabel = (rama: Rama): string => {
    return RAMA_LABELS[rama];
  };

  /** Get value for rama option */
  getRamaValue = (rama: Rama): string => {
    return rama;
  };
}
