import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_CONFIG } from '../../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class BackupsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.BASE_URL;

  downloadSqlBackup(): Observable<void> {
    return this.downloadBlob(
      `${this.baseUrl}/backups/download`,
      'scout-backup.sql.gz',
    );
  }

  downloadXlsxExport(): Observable<void> {
    return this.downloadBlob(
      `${this.baseUrl}/exports/xlsx`,
      'scout-export.xlsx',
    );
  }

  private downloadBlob(url: string, fallbackFilename: string): Observable<void> {
    return this.http
      .get(url, { responseType: 'blob', observe: 'response' })
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const blob = response.body;
          if (!blob) {
            throw new Error('Empty response body');
          }
          const filename = this.parseFilename(
            response.headers.get('content-disposition'),
            fallbackFilename,
          );
          this.triggerBrowserDownload(blob, filename);
        }),
      );
  }

  private parseFilename(
    contentDisposition: string | null,
    fallback: string,
  ): string {
    if (!contentDisposition) {
      return fallback;
    }
    const match = /filename="?([^";]+)"?/.exec(contentDisposition);
    return match?.[1] ?? fallback;
  }

  private triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }
}
