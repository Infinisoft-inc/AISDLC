/**
 * Generate branch name
 * Single responsibility: Generate standardized branch names
 */

export function generateBranchName(issueType: 'epic' | 'feature' | 'task', issueData: any): string {
  const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp

  switch (issueType) {
    case 'epic':
      return `epic/${sanitize(issueData.domainName || issueData.title)}-${timestamp}`;
    case 'feature':
      return `feature/${sanitize(issueData.frReference || issueData.title)}-${timestamp}`;
    case 'task':
      return `task/${sanitize(issueData.title.replace(/^\[TASK\]\s*/, ''))}-${timestamp}`;
    default:
      return `issue/${sanitize(issueData.title)}-${timestamp}`;
  }
}
