/**
 * Advanced Composition Example
 * Demonstrates creating custom compositions using atomic functions
 */

import { createGitHubSetup } from '@brainstack/integration-service';
import { 
  createIssue, 
  addIssueLabel, 
  setIssueType, 
  addSubIssue, 
  createLinkedBranch,
  createComment,
  addIssueToProject,
  generateBranchName 
} from '../src/github';
import type { GitHubIssueData, Result } from '../src/github/types';

/**
 * Custom composition: Create Bug Report with full workflow
 */
async function createBugReport(
  octokit: any,
  owner: string,
  repo: string,
  bugData: GitHubIssueData & { 
    severity: 'low' | 'medium' | 'high' | 'critical';
    reproductionSteps: string[];
    expectedBehavior: string;
    actualBehavior: string;
  }
): Promise<Result<any>> {
  try {
    console.log(`🐛 Creating Bug Report: ${bugData.title}`);

    // Step 1: Create the bug issue
    const issueResult = await createIssue(octokit, owner, repo, {
      title: bugData.title,
      body: `# Bug Report

## Severity
${bugData.severity.toUpperCase()}

## Expected Behavior
${bugData.expectedBehavior}

## Actual Behavior
${bugData.actualBehavior}

## Reproduction Steps
${bugData.reproductionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Additional Information
${bugData.body || 'No additional information provided.'}`,
      labels: [...(bugData.labels || []), 'bug', `severity-${bugData.severity}`],
    });

    if (!issueResult.success) {
      return issueResult;
    }

    const issue = issueResult.data!;

    // Step 2: Add severity-specific labels
    await addIssueLabel(octokit, owner, repo, issue.number, `priority-${bugData.severity}`);
    
    if (bugData.severity === 'critical') {
      await addIssueLabel(octokit, owner, repo, issue.number, 'urgent');
    }

    // Step 3: Create linked branch for bug fix
    const branchName = `bugfix/${issue.number}-${bugData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const branchResult = await createLinkedBranch(octokit, owner, repo, issue.number, branchName);

    // Step 4: Add initial comment with triage information
    await createComment(octokit, owner, repo, issue.number, {
      body: `🔍 **Bug Triage Information**

**Severity:** ${bugData.severity.toUpperCase()}
**Status:** Needs Investigation
**Assigned Branch:** ${branchResult.success ? branchName : 'Branch creation failed'}

**Next Steps:**
1. Investigate root cause
2. Implement fix
3. Add regression tests
4. Verify fix resolves issue`
    });

    console.log(`✅ Bug Report created: #${issue.number} - ${issue.html_url}`);
    if (branchResult.success) {
      console.log(`   📁 Fix branch: ${branchName}`);
    }

    return {
      success: true,
      data: {
        ...issue,
        severity: bugData.severity,
        fixBranch: branchResult.success ? branchResult.data : null,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Custom composition: Create Release Planning Epic
 */
async function createReleasePlan(
  octokit: any,
  owner: string,
  repo: string,
  releaseData: {
    version: string;
    targetDate: string;
    features: string[];
    bugFixes: string[];
  }
): Promise<Result<any>> {
  try {
    console.log(`🚀 Creating Release Plan: v${releaseData.version}`);

    // Step 1: Create release epic
    const epicResult = await createIssue(octokit, owner, repo, {
      title: `[RELEASE] Version ${releaseData.version}`,
      body: `# Release Plan: Version ${releaseData.version}

## Target Release Date
${releaseData.targetDate}

## Features Included
${releaseData.features.map(feature => `- [ ] ${feature}`).join('\n')}

## Bug Fixes Included
${releaseData.bugFixes.map(bug => `- [ ] ${bug}`).join('\n')}

## Release Checklist
- [ ] All features implemented and tested
- [ ] All bug fixes verified
- [ ] Documentation updated
- [ ] Release notes prepared
- [ ] Deployment scripts ready
- [ ] Stakeholder approval obtained`,
      labels: ['release', 'epic', `v${releaseData.version}`],
    });

    if (!epicResult.success) {
      return epicResult;
    }

    const epic = epicResult.data!;

    // Step 2: Add release-specific labels
    await addIssueLabel(octokit, owner, repo, epic.number, 'planning');
    await addIssueLabel(octokit, owner, repo, epic.number, 'milestone');

    // Step 3: Create release branch
    const branchName = `release/v${releaseData.version}`;
    const branchResult = await createLinkedBranch(octokit, owner, repo, epic.number, branchName);

    // Step 4: Add planning comment
    await createComment(octokit, owner, repo, epic.number, {
      body: `📋 **Release Planning Initiated**

**Version:** ${releaseData.version}
**Target Date:** ${releaseData.targetDate}
**Release Branch:** ${branchResult.success ? branchName : 'Branch creation failed'}

**Planning Status:**
- Features to implement: ${releaseData.features.length}
- Bug fixes to address: ${releaseData.bugFixes.length}

**Next Steps:**
1. Create feature issues for each planned feature
2. Create bug fix issues for each planned fix
3. Link all issues to this release epic
4. Begin development work`
    });

    console.log(`✅ Release Plan created: #${epic.number} - ${epic.html_url}`);
    if (branchResult.success) {
      console.log(`   📁 Release branch: ${branchName}`);
    }

    return {
      success: true,
      data: {
        ...epic,
        version: releaseData.version,
        targetDate: releaseData.targetDate,
        releaseBranch: branchResult.success ? branchResult.data : null,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function advancedCompositionExample() {
  console.log('🚀 GitHub Service - Advanced Composition Example\n');

  // Get authenticated GitHub client
  const dopplerToken = process.env.DOPPLER_TOKEN!;
  const organization = 'Infinisoft-inc';
  
  const clientResult = await createGitHubSetup(dopplerToken, organization);
  if (!clientResult.success) {
    console.error('❌ Failed to get GitHub client:', clientResult.error);
    return;
  }
  
  const octokit = clientResult.data;
  console.log('✅ GitHub client authenticated successfully\n');

  // Example 1: Create a bug report with custom workflow
  console.log('🐛 Example 1: Creating Bug Report...');
  const bugResult = await createBugReport(octokit, organization, 'AISDLC', {
    title: 'Login form validation not working correctly',
    severity: 'high',
    reproductionSteps: [
      'Navigate to login page',
      'Enter invalid email format (e.g., "test@")',
      'Click submit button',
      'Observe that form submits without validation error'
    ],
    expectedBehavior: 'Form should show validation error for invalid email format',
    actualBehavior: 'Form submits without any validation, causing server error',
    body: 'This affects user experience and causes confusion.',
    labels: ['frontend', 'validation'],
  });

  if (bugResult.success) {
    console.log(`✅ Bug report created successfully: #${bugResult.data?.number}`);
  } else {
    console.error('❌ Bug report creation failed:', bugResult.error);
  }

  // Example 2: Create a release plan
  console.log('\n🚀 Example 2: Creating Release Plan...');
  const releaseResult = await createReleasePlan(octokit, organization, 'AISDLC', {
    version: '2.1.0',
    targetDate: '2024-02-15',
    features: [
      'Advanced user permissions system',
      'Real-time notifications',
      'Enhanced search functionality',
      'Mobile app improvements'
    ],
    bugFixes: [
      'Fix login validation issue',
      'Resolve memory leak in dashboard',
      'Fix timezone display problems',
      'Correct email template formatting'
    ]
  });

  if (releaseResult.success) {
    console.log(`✅ Release plan created successfully: #${releaseResult.data?.number}`);
  } else {
    console.error('❌ Release plan creation failed:', releaseResult.error);
  }

  console.log('\n🎯 Advanced Composition Example Summary:');
  console.log('   ✅ Demonstrated custom bug report workflow');
  console.log('   ✅ Demonstrated custom release planning workflow');
  console.log('   ✅ Showed how to combine atomic functions for custom needs');
  console.log('\n✅ Advanced composition example completed successfully!');
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  advancedCompositionExample().catch(console.error);
}

export { advancedCompositionExample, createBugReport, createReleasePlan };
