/**
 * GitHub service types
 * Pure types with no dependencies
 */

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GitHubIssueData {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  milestone?: number;
}

export interface GitHubIssueResponse {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  node_id: string;
}

export interface BranchData {
  name: string;
  sha: string;
}

export interface BranchResponse {
  name: string;
  sha: string;
  url: string;
}

export interface GitHubRepositoryData {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
  license_template?: string;
}

export interface GitHubRepositoryResponse {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  private: boolean;
  default_branch: string;
}

export interface ProjectData {
  title: string;
  description?: string;
}

export interface ProjectResponse {
  id: string;
  number: number;
  title: string;
  url: string;
  description?: string;
}

export interface LinkedBranchData {
  branchName: string;
  branchId: string;
  commitOid: string;
  issueNumber: number;
}

export interface CommentData {
  body: string;
}

export interface CommentResponse {
  id: number;
  html_url: string;
  body: string;
  created_at: string;
}
