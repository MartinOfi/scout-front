/**
 * Common Mock Factories for Testing
 * Provides type-safe mocks for Router, ActivatedRoute, and ConfirmDialogService
 * Used across all test suites to eliminate `any` types
 */

import { Router, ActivatedRoute, Params, NavigationExtras } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Typed Mock Router - Compatible with Vitest
 */
export interface MockRouter {
  navigate: (commands: any[], extras?: NavigationExtras) => Promise<boolean>;
  navigateByUrl: (url: string) => Promise<boolean>;
}

export function createMockRouter(): MockRouter {
  return {
    navigate: () => Promise.resolve(true),
    navigateByUrl: () => Promise.resolve(true),
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
  queryParams: Params = {}
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
