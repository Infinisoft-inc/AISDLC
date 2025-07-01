/**
 * Composition utility tests
 */

import { pipe, compose, curry, partial, identity, constant, tap, when } from '../../utils/compose.js';

describe('Composition utilities', () => {
  describe('pipe', () => {
    test('should chain transformations', () => {
      const result = pipe(5)
        .to(x => x * 2)
        .to(x => x + 1)
        .value();
      
      expect(result).toBe(11);
    });
  });

  describe('compose', () => {
    test('should compose functions right to left', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const composed = compose(multiply2, add1);
      
      expect(composed(5)).toBe(12); // (5 + 1) * 2
    });
  });

  describe('curry', () => {
    test('should curry binary function', () => {
      const add = (a: number, b: number) => a + b;
      const curriedAdd = curry(add);
      
      expect(curriedAdd(5)(3)).toBe(8);
    });
  });

  describe('partial', () => {
    test('should partially apply function', () => {
      const add = (a: number, b: number) => a + b;
      const add5 = partial(add, 5);
      
      expect(add5(3)).toBe(8);
    });
  });

  describe('identity', () => {
    test('should return input unchanged', () => {
      expect(identity(42)).toBe(42);
      expect(identity('test')).toBe('test');
    });
  });

  describe('constant', () => {
    test('should return constant value', () => {
      const getValue = constant(42);
      expect(getValue()).toBe(42);
    });
  });

  describe('tap', () => {
    test('should execute side effect and return value', () => {
      let sideEffect = '';
      const result = tap((x: string) => { sideEffect = x; })('test');
      
      expect(result).toBe('test');
      expect(sideEffect).toBe('test');
    });
  });

  describe('when', () => {
    test('should apply function when predicate is true', () => {
      const double = (x: number) => x * 2;
      const isEven = (x: number) => x % 2 === 0;
      const doubleIfEven = when(isEven, double);
      
      expect(doubleIfEven(4)).toBe(8);
      expect(doubleIfEven(5)).toBe(5);
    });
  });
});
