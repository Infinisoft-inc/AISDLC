// Simple types for GitHub service

export interface GitHubAppConfig {
  appId: string;
  clientId: string;
  clientSecret: string;
  privateKey: string;
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
