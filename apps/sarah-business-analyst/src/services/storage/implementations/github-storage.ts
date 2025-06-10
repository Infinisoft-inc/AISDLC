import { StorageService, DocumentInfo } from "../storage.js";
import { Octokit } from "@octokit/rest";

/**
 * GitHub storage implementation - Very simple, no cross concerns
 */
export class GitHubStorage implements StorageService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(
    tokenOrOctokit: string | Octokit,
    owner: string,
    repo: string,
    branch: string = "main"
  ) {
    if (typeof tokenOrOctokit === 'string') {
      this.octokit = new Octokit({ auth: tokenOrOctokit });
    } else {
      this.octokit = tokenOrOctokit;
    }
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
  }

  async save(path: string, content: string) {
    try {
      // Check if file exists to get SHA for updates
      let sha: string | undefined;
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
          ref: this.branch,
        });

        if ('sha' in data) {
          sha = data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's fine for new files
      }

      // Create or update file
      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: `Update ${path}`,
        content: Buffer.from(content).toString('base64'),
        committer: {
          name: 'Sarah - AI Business Analyst',
          email: 'sarah@infinisoft.world'
        },
        author: {
          name: 'Sarah - AI Business Analyst',
          email: 'sarah@infinisoft.world'
        },
        branch: this.branch,
        ...(sha && { sha }),
      });

      return {
        success: true,
        url: data.content?.html_url || `https://github.com/${this.owner}/${this.repo}/blob/${this.branch}/${path}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async read(path: string): Promise<{ success: boolean; content?: string; error?: string; }> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      });

      if ('content' in data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
          success: true,
          content,
        };
      }

      return {
        success: false,
        error: 'File content not available',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async list(): Promise<{ success: boolean; documents?: DocumentInfo[]; error?: string; }> {
    try {
      // For simplicity, we'll list files in the root directory
      // In a real implementation, you might want to recursively list all files
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: '',
        ref: this.branch,
      });

      if (Array.isArray(data)) {
        const documents: DocumentInfo[] = data
          .filter(item => item.type === 'file')
          .map(item => ({
            path: item.path,
            name: item.name,
            size: item.size,
            url: item.html_url || undefined,
          }));

        return {
          success: true,
          documents,
        };
      }

      return {
        success: true,
        documents: [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
