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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
