import { Pipe, PipeTransform } from '@angular/core';

/**
 * Service status format pipe
 *
 * Stub pipe for compatibility - returns the input value as-is.
 * Can be extended to format/translate status values if needed.
 */
@Pipe({
  name: 'serviceStatusFormat',
  standalone: true,
})
export class ServiceStatusFormatPipe implements PipeTransform {
  /**
   * Transforms a status value (passthrough)
   *
   * @param value - Status value
   * @returns The same value, converted to string if needed
   */
  transform(value: string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString();
  }
}
