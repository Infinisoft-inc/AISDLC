/**
 * Result types for functional error handling
 */

import type { ReadonlyRecord } from './features.js';

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E = string> {
  readonly success: false;
  readonly error: E;
}

export type Result<T, E = string> = Success<T> | Failure<E>;

export interface ValidationSuccess {
  readonly valid: true;
  readonly data: unknown;
}

export interface ValidationFailure {
  readonly valid: false;
  readonly errors: readonly ValidationError[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface ValidationError {
  readonly path: string;
  readonly message: string;
  readonly value: unknown;
}

export interface ReadonlyFrameworkError {
  readonly code: string;
  readonly message: string;
  readonly context: ReadonlyRecord<string, unknown>;
  readonly retryable: boolean;
}
