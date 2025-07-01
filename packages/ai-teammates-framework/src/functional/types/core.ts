/**
 * Core functional types for AI Teammates Framework
 * Immutable data structures and pure function signatures
 */

import type {
  ReadonlyTransportConfig,
  ReadonlyDopplerConfig,
  ReadonlyStorageConfig,
  ReadonlyGitHubConfig,
  ReadonlyFeaturesConfig
} from './transport.js';

// ============================================================================
// Immutable Data Types
// ============================================================================

export interface ReadonlyConfig {
  readonly agent: ReadonlyAgentConfig;
  readonly organization: ReadonlyOrganizationConfig;
  readonly integrations: ReadonlyIntegrationsConfig;
  readonly transport: ReadonlyTransportConfig;
  readonly features: ReadonlyFeaturesConfig;
}

export interface ReadonlyAgentConfig {
  readonly name: string;
  readonly role: string;
  readonly personality: ReadonlyPersonalityConfig;
}

export interface ReadonlyPersonalityConfig {
  readonly avatar: string;
  readonly voice: string;
  readonly expertise: readonly string[];
  readonly communicationStyle: string;
  readonly defaultPrompts: readonly string[];
}

export interface ReadonlyOrganizationConfig {
  readonly name: string;
  readonly defaultRepo: string;
  readonly defaultBranch: string;
  readonly defaultReviewer: string;
}

export interface ReadonlyIntegrationsConfig {
  readonly doppler: ReadonlyDopplerConfig;
  readonly storage: ReadonlyStorageConfig;
  readonly github: ReadonlyGitHubConfig;
}

export type {
  ReadonlyTransportConfig,
  ReadonlyDopplerConfig,
  ReadonlyStorageConfig,
  ReadonlyGitHubConfig,
  ReadonlyFeaturesConfig
};
