// Simple types for GitHub service

export interface GitHubAppConfig {
  appId: string;
  clientId: string;
  clientSecret: string;
  privateKey: string;
}

export interface InstallationData {
  installationId: number;
  accountId: number;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  accessToken?: string;
  expiresAt?: string;
  permissions: Record<string, string>;
  createdAt: string;
}

export interface RepositoryData {
  name: string;
  description?: string;
  private?: boolean;
  owner?: string;
}

export interface IssueData {
  title: string;
  body?: string;
  labels?: string[];
  milestone?: string;
  assignees?: string[];
}

export interface ProjectBoardData {
  name: string;
  description?: string;
  columns?: string[];
}

export interface WebhookPayload {
  action: string;
  installation?: {
    id: number;
    account: {
      id: number;
      login: string;
      type: string;
    };
    permissions: Record<string, string>;
  };
  repositories?: Array<{
    id: number;
    name: string;
    full_name: string;
  }>;
}
