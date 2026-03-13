import { Pipe, PipeTransform } from '@angular/core';

/**
 * Date format pipe
 *
 * Formats dates in Spanish (es-AR) locale with various format options.
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Format options for different display types
   */
  private readonly formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    date: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    datetime: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    datelong: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  };

  /**
   * Transforms a date value to a formatted string
   *
   * @param value - Date value (Date, string, number, or null/undefined)
   * @param format - Format type: 'date', 'time', 'datetime', or 'datelong'
   * @returns Formatted date string or empty string if invalid
   */
  transform(value: unknown, format: 'date' | 'time' | 'datetime' | 'datelong' = 'date'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    try {
      const date = this.parseDate(value);
      if (!date || isNaN(date.getTime())) {
        return '';
      }

      const options = this.formatOptions[format] || this.formatOptions['date'];
      return new Intl.DateTimeFormat('es-AR', options).format(date);
    } catch {
      return '';
    }
  }

  /**
   * Parses various date formats into a Date object
   *
   * For "date-only" ISO strings (ending in T00:00:00.000Z), we parse them
   * as local dates to avoid timezone offset issues where "2026-03-13T00:00:00.000Z"
   * would display as "12/03/2026" in Argentina (UTC-3).
   */
  private parseDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      return new Date(value);
    }

    if (typeof value === 'string') {
      // Handle DD/MM/YYYY format
      if (value.includes('/')) {
        const parts = value.split(' ');
        const datePart = parts[0];
        const timePart = parts[1];

        const [day, month, year] = datePart.split('/').map(Number);

        if (day && month && year) {
          const date = new Date(year, month - 1, day);

          // Add time if present
          if (timePart) {
            const [hours, minutes] = timePart.split(':').map(Number);
            if (!isNaN(hours)) date.setHours(hours);
            if (!isNaN(minutes)) date.setMinutes(minutes);
          }

          return date;
        }
      }

      // Handle "date-only" ISO strings (e.g., "2026-03-13T00:00:00.000Z")
      // These should be treated as local dates, not UTC
      if (this.isDateOnlyIsoString(value)) {
        return this.parseAsLocalDate(value);
      }

      // Try standard Date parsing for other formats
      return new Date(value);
    }

    return null;
  }

  /**
   * Checks if a string is a "date-only" ISO format
   * Pattern: YYYY-MM-DDT00:00:00.000Z or YYYY-MM-DDT00:00:00Z
   */
  private isDateOnlyIsoString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z$/.test(value);
  }

  /**
   * Parses an ISO date string as a local date (ignoring timezone)
   * "2026-03-13T00:00:00.000Z" → Date representing March 13, 2026 in local time
   */
  private parseAsLocalDate(isoString: string): Date {
    const [year, month, day] = isoString.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
