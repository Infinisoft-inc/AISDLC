/**
 * Result utility functions for functional error handling
 */

import type { Result, Success, Failure } from '../types/result.js';

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data
});

export const failure = <E = string>(error: E): Failure<E> => ({
  success: false,
  error
});

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success === true;

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.success === false;

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> =>
  isSuccess(result) ? success(fn(result.data)) : result;

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> =>
  isSuccess(result) ? fn(result.data) : result;

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> =>
  isFailure(result) ? failure(fn(result.error)) : result;
