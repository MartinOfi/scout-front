/**
 * Base Form Builder
 * Clase abstracta base para todos los form builders
 */

import { FormGroup, FormBuilder } from '@angular/forms';

/**
 * Abstract base class for form builders
 */
export abstract class BaseFormBuilder {
  constructor(protected fb: FormBuilder) {}

  /**
   * Build the form
   */
  abstract buildForm(): FormGroup;

  /**
   * Extract DTO from form values
   */
  abstract extractDto(form: FormGroup): unknown;

  /**
   * Mark all controls as touched
   */
  markAllAsTouched(form: FormGroup): void {
    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  /**
   * Reset form to initial state
   */
  resetForm(form: FormGroup): void {
    form.reset();
    Object.values(form.controls).forEach(control => {
      control.markAsUntouched();
      control.markAsPristine();
    });
  }
}
