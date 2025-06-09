# GitHub Service Examples

Practical examples demonstrating the new pure SRP GitHub service architecture.

## Examples

### 🚀 Basic Usage (`examples/basic-usage.ts`)
Demonstrates the fundamental workflow:
- Getting authenticated GitHub client using integration service
- Creating Epic → Feature → Task hierarchy
- Using atomic functions for custom workflows

**Run:**
```bash
DOPPLER_TOKEN=your-token pnpm example:basic
```

### 🔧 Advanced Composition (`examples/advanced-composition.ts`)
Shows how to create custom compositions using atomic functions:
- Custom bug report workflow with severity handling
- Release planning with automated branch creation
- Combining multiple atomic functions for complex workflows

**Run:**
```bash
DOPPLER_TOKEN=your-token pnpm example:advanced
```

## Key Concepts Demonstrated

### 🏗️ Pure SRP Architecture
```typescript
// Atomic functions (1 responsibility each)
import { createIssue, addIssueLabel, createComment } from '../src/github';

// Composition functions (preserve customizations)
import { createEpic, createFeature, createTask } from '../src/compositions';
```

### 🔌 Dependency Injection
```typescript
// Get GitHub client from integration service
const clientResult = await createGitHubSetup(dopplerToken, organization);
const octokit = clientResult.data;

// Pass client to all functions (no hidden dependencies)
await createIssue(octokit, owner, repo, issueData);
```

### 🧩 Custom Compositions
```typescript
// Create custom workflows by combining atomic functions
async function createBugReport(octokit, owner, repo, bugData) {
  const issueResult = await createIssue(octokit, owner, repo, issueData);
  await addIssueLabel(octokit, owner, repo, issue.number, `severity-${bugData.severity}`);
  await createLinkedBranch(octokit, owner, repo, issue.number, branchName);
  await createComment(octokit, owner, repo, issue.number, triageComment);
  return result;
}
```

### 🔗 AI-SDLC Hierarchy
```typescript
// Epic → Feature → Task with real GitHub relationships
const epic = await createEpic(octokit, owner, repo, epicData);
const feature = await createFeature(octokit, owner, repo, {
  ...featureData,
  parentEpicNumber: epic.data.number
});
const task = await createTask(octokit, owner, repo, {
  ...taskData,
  parentFeatureNumber: feature.data.number
});
```

## Environment Setup

Set your Doppler token before running examples:
```bash
export DOPPLER_TOKEN=your-actual-doppler-token
```

Or create a `.env` file:
```bash
DOPPLER_TOKEN=your-actual-doppler-token
```

## Example Output

Examples provide rich console output:
```
🚀 GitHub Service - Basic Usage Example

📡 Step 1: Getting authenticated GitHub client...
✅ GitHub client authenticated successfully

📋 Step 2: Creating Epic...
✅ Epic created: #123 - https://github.com/org/repo/issues/123
   📁 Linked branch: epic/e-commerce-platform

🔧 Step 3: Creating Feature...
✅ Feature created: #124 - https://github.com/org/repo/issues/124
   🔗 Linked to Epic: #123
   📁 Linked branch: feature/fr-auth-001

⚙️ Step 4: Creating Task...
✅ Task created: #125 - https://github.com/org/repo/issues/125
   🔗 Linked to Feature: #124
   📁 Linked branch: task/implement-user-registration-api-endpoint

🎯 Summary:
   Epic: #123
   Feature: #124
   Task: #125

✅ Basic usage example completed successfully!
```

## Benefits Demonstrated

### ✅ Reusability
- Atomic functions can be used independently
- Compositions can be mixed and matched
- Custom workflows are easy to create

### ✅ Testability
- Each function has single responsibility
- Dependencies are injected (no hidden state)
- Easy to mock and unit test

### ✅ Maintainability
- Clear separation of concerns
- Predictable function signatures
- Easy to understand and modify

### ✅ Preserved Customizations
- All AI-SDLC features maintained
- GitHub issue types and sub-issues work
- Linked branches and smart fallbacks
- Comprehensive error handling
