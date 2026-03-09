/**
 * Safe Text Validator
 * Valida que el texto no contenga caracteres peligrosos (XSS prevention)
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Patrones peligrosos para prevenir XSS
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // event handlers como onclick, onload, etc.
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

/**
 * Validator for safe text (XSS prevention)
 */
export function safeTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') return null;
    
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(value)) {
        return { unsafeText: { value } };
      }
    }
    
    return null;
  };
}
