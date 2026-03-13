/**
 * API Response models
 * Typed responses - NO any
 */

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: Date;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata from backend response
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Paginated response from backend
 * Structure: { data: T[], meta: PaginationMeta }
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
