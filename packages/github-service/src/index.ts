/**
 * GitHub Service - Clean Architecture Implementation
 *
 * Pure SRP (Single Responsibility Principle) architecture with:
 * - Layer 1: Atomic GitHub functions (1 responsibility per function)
 * - Layer 2: Composition functions (preserve AI-SDLC customizations)
 * - Dependency injection throughout
 * - Comprehensive testing with real API integration
 */

// Export all atomic GitHub functions
export * from './github/index.js';

// Export all composition functions
export * from './compositions/index.js';

// Export types
export * from './types.js';
