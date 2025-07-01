/**
 * Result utility tests
 */

import { success, failure, isSuccess, isFailure, map, flatMap, mapError } from '../../utils/result.js';

describe('Result utilities', () => {
  describe('success', () => {
    test('should create success result', () => {
      const result = success('test');
      expect(result).toEqual({ success: true, data: 'test' });
    });
  });

  describe('failure', () => {
    test('should create failure result', () => {
      const result = failure('error');
      expect(result).toEqual({ success: false, error: 'error' });
    });
  });

  describe('isSuccess', () => {
    test('should return true for success result', () => {
      expect(isSuccess(success('test'))).toBe(true);
    });

    test('should return false for failure result', () => {
      expect(isSuccess(failure('error'))).toBe(false);
    });
  });

  describe('isFailure', () => {
    test('should return false for success result', () => {
      expect(isFailure(success('test'))).toBe(false);
    });

    test('should return true for failure result', () => {
      expect(isFailure(failure('error'))).toBe(true);
    });
  });

  describe('map', () => {
    test('should transform success value', () => {
      const result = map(success(5), x => x * 2);
      expect(result).toEqual(success(10));
    });

    test('should pass through failure', () => {
      const result = map(failure('error'), (x: number) => x * 2);
      expect(result).toEqual(failure('error'));
    });
  });

  describe('flatMap', () => {
    test('should chain success operations', () => {
      const result = flatMap(success(5), x => success(x * 2));
      expect(result).toEqual(success(10));
    });

    test('should handle chained failure', () => {
      const result = flatMap(success(5), () => failure('chain error'));
      expect(result).toEqual(failure('chain error'));
    });

    test('should pass through initial failure', () => {
      const result = flatMap(failure('initial error'), (x: number) => success(x * 2));
      expect(result).toEqual(failure('initial error'));
    });
  });

  describe('mapError', () => {
    test('should transform failure error', () => {
      const result = mapError(failure('error'), err => `transformed: ${err}`);
      expect(result).toEqual(failure('transformed: error'));
    });

    test('should pass through success', () => {
      const result = mapError(success('data'), (err: string) => `transformed: ${err}`);
      expect(result).toEqual(success('data'));
    });
  });
});
