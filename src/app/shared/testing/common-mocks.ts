/**
 * Common Mock Factories for Testing
 * Provides type-safe mocks for Router, ActivatedRoute, and ConfirmDialogService
 * Used across all test suites to eliminate `any` types
 */

import { vi } from 'vitest';
import { Router, ActivatedRoute, Params, NavigationExtras } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Typed Mock Router - Compatible with Vitest
 * Uses vi.fn() for spy capabilities (toHaveBeenCalled, toHaveBeenCalledWith)
 */
export interface MockRouter {
  navigate: ReturnType<typeof vi.fn>;
  navigateByUrl: ReturnType<typeof vi.fn>;
}

export function createMockRouter(): MockRouter {
  return {
    navigate: vi.fn().mockResolvedValue(true),
    navigateByUrl: vi.fn().mockResolvedValue(true),
  };
}

/**
 * Typed Mock ActivatedRoute
 */
export interface MockActivatedRoute {
  params: Observable<Params>;
  queryParams: Observable<Params>;
  snapshot: { params: Params; queryParams: Params };
}

export function createMockActivatedRoute(
  params: Params = {},
  queryParams: Params = {},
): MockActivatedRoute {
  return {
    params: of(params),
    queryParams: of(queryParams),
    snapshot: { params, queryParams },
  };
}

/**
 * Typed Mock ConfirmDialogService - Compatible with Vitest
 */
export interface MockConfirmDialogService {
  confirm: (options: { title: string; message: string }) => Promise<boolean>;
  confirmDelete: (entityName: any) => Promise<boolean>;
}

export function createMockConfirmDialogService(): MockConfirmDialogService {
  return {
    confirm: () => Promise.resolve(true),
    confirmDelete: () => Promise.resolve(true),
  };
}
