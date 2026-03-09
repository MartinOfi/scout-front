/**
 * Test Helper Utilities
 * Provides utilities for common testing scenarios
 */

import { Signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

/**
 * Flush Angular microtasks and effects
 * Use this instead of setTimeout for deterministic tests
 */
export function flushMicrotasks(): void {
  TestBed.flushEffects();
}

/**
 * Set a signal value and flush effects
 * Ensures the signal change is propagated immediately
 */
export function setSignalValue<T>(signal: WritableSignal<T>, value: T): void {
  signal.set(value);
  TestBed.flushEffects();
}

/**
 * Assert that a signal has the expected value
 */
export function expectSignalValue<T>(signal: Signal<T>, expected: T): void {
  TestBed.flushEffects();
  expect(signal()).toEqual(expected);
}

/**
 * Assert that a form is valid
 */
export function expectFormValid(form: FormGroup): void {
  expect(form.valid).toBe(true);
}

/**
 * Assert that a form is invalid
 */
export function expectFormInvalid(form: FormGroup): void {
  expect(form.valid).toBe(false);
}

/**
 * Assert that a form has a specific error on a control
 */
export function expectFormError(
  form: FormGroup,
  controlName: string,
  errorName: string
): void {
  const control = form.get(controlName);
  expect(control?.hasError(errorName)).toBe(true);
}

/**
 * Assert that a form has no errors on a control
 */
export function expectFormControlValid(
  form: FormGroup,
  controlName: string
): void {
  const control = form.get(controlName);
  expect(control?.errors).toBeNull();
}
