/**
 * Function composition utilities
 */

export const pipe = <T>(value: T) => ({
  to: <U>(fn: (input: T) => U) => pipe(fn(value)),
  value: () => value
});

export const compose = <A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
) => (a: A): C => f(g(a));

export const curry = <A, B, C>(
  fn: (a: A, b: B) => C
) => (a: A) => (b: B): C => fn(a, b);

export const partial = <A, B, C>(
  fn: (a: A, b: B) => C,
  a: A
) => (b: B): C => fn(a, b);

export const identity = <T>(value: T): T => value;

export const constant = <T>(value: T) => (): T => value;

export const tap = <T>(fn: (value: T) => void) => (value: T): T => {
  fn(value);
  return value;
};

export const when = <T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
) => (value: T): T => predicate(value) ? fn(value) : value;
