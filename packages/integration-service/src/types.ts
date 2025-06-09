/**
 * Types for integration service
 */

export interface DopplerConfig {
  token: string;
  project?: string;
  config?: string;
}

export interface SupabaseCredentials {
  url: string;
  serviceRoleKey: string;
}

export interface GitHubCredentials {
  appId: string;
  clientId: string;
  clientSecret: string;
  privateKey: string;
}

export interface TenantData {
  organizationName: string;
  installationId: number;
  accountLogin: string;
  accountType: string;
}

export interface IntegrationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
