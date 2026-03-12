import { Pipe, PipeTransform } from '@angular/core';

/**
 * Humanize pipe
 *
 * Transforms snake_case or kebab-case text into readable format.
 * Replaces underscores/hyphens with spaces and applies proper capitalization.
 *
 * @example
 * {{ 'scout_argentina' | humanize }}          → 'Scout Argentina'
 * {{ 'pago_inscripcion' | humanize }}         → 'Pago Inscripcion'
 * {{ 'some-kebab-case' | humanize }}          → 'Some Kebab Case'
 * {{ 'ALREADY_CAPS' | humanize }}             → 'Already Caps'
 * {{ 'mixed_Case_text' | humanize }}          → 'Mixed Case Text'
 * {{ 'Pago inscripción scout_argentina 2026' | humanize }} → 'Pago Inscripción Scout Argentina 2026'
 */
@Pipe({
  name: 'humanize',
  standalone: true,
})
export class HumanizePipe implements PipeTransform {
  /**
   * Transforms text by replacing underscores/hyphens with spaces
   * and capitalizing each word.
   *
   * @param value - Text to transform (string or null/undefined)
   * @param mode - Capitalization mode: 'title' (default), 'sentence', or 'none'
   * @returns Humanized text or empty string if invalid
   */
  transform(
    value: string | null | undefined,
    mode: 'title' | 'sentence' | 'none' = 'title'
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Replace underscores and hyphens with spaces
    let result = value.replace(/[_-]/g, ' ');

    // Apply capitalization based on mode
    switch (mode) {
      case 'title':
        result = this.toTitleCase(result);
        break;
      case 'sentence':
        result = this.toSentenceCase(result);
        break;
      case 'none':
        // Just replace separators, no case change
        break;
    }

    return result;
  }

  /**
   * Converts text to Title Case (each word capitalized)
   */
  private toTitleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Converts text to Sentence case (only first word capitalized)
   */
  private toSentenceCase(text: string): string {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
}

/**
 * Utility function for use outside templates
 * (same logic as HumanizePipe)
 */
export function humanize(
  value: string | null | undefined,
  mode: 'title' | 'sentence' | 'none' = 'title'
): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  let result = value.replace(/[_-]/g, ' ');

  switch (mode) {
    case 'title':
      return result
        .toLowerCase()
        .split(' ')
        .map(word => (word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' ');
    case 'sentence':
      const lower = result.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    case 'none':
      return result;
    default:
      return result;
  }
}
