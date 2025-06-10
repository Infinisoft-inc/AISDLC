import { Octokit } from '@octokit/rest';
import { createGitHubSetup } from '@brainstack/integration-service';
import { JordanMemoryManager } from '../memory.js';
import {
  createURDTemplate,
  createSRSTemplate,
  createADDTemplate,
  createFRSTemplate,
  createImplementationPlanTemplate
} from './documentTemplates.js';

export interface DocumentStructureData {
  owner: string;
  repo: string;
  projectName: string;
  organization?: string;
}

export interface DocumentStructureResult {
  success: boolean;
  data?: {
    filesCreated: string[];
    summary: string;
  };
  error?: string;
}

/**
 * Create complete AI-SDLC document structure with templates and README
 */
export async function createDocumentStructure(
  data: DocumentStructureData,
  memory: JordanMemoryManager
): Promise<DocumentStructureResult> {
  const { owner, repo, projectName, organization = "Infinisoft-inc" } = data;

  try {
    console.log(`📁 Creating document structure for ${projectName}...`);

    // Get authenticated GitHub client
    const dopplerToken = process.env.DOPPLER_TOKEN;
    if (!dopplerToken) {
      throw new Error('DOPPLER_TOKEN environment variable not found');
    }
    
    const githubSetupResult = await createGitHubSetup(dopplerToken, organization);
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;

    const filesToCreate = [
      {
        path: 'README.md',
        content: createREADME(projectName)
      },
      {
        path: 'docs/README.md',
        content: createDocsREADME(projectName)
      },
      {
        path: 'docs/phase1-planning/business-case-template.md',
        content: createBusinessCaseTemplate()
      },
      {
        path: 'docs/phase1-planning/brd-template.md',
        content: createBRDTemplate()
      },
      {
        path: 'docs/phase1-planning/urd-template.md',
        content: createURDTemplate()
      },
      {
        path: 'docs/phase1-planning/srs-template.md',
        content: createSRSTemplate()
      },
      {
        path: 'docs/phase1-planning/add-template.md',
        content: createADDTemplate()
      },
      {
        path: 'docs/phase2-implementation/frs-template.md',
        content: createFRSTemplate()
      },
      {
        path: 'docs/phase2-implementation/implementation-plan-template.md',
        content: createImplementationPlanTemplate()
      }
    ];

    const filesCreated: string[] = [];

    for (const file of filesToCreate) {
      try {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: file.path,
          message: `docs: Add ${file.path} for AI-SDLC methodology`,
          content: Buffer.from(file.content).toString('base64'),
          committer: {
            name: 'Jordan - AI Project Manager',
            email: 'jordan@ai-sdlc.dev'
          },
          author: {
            name: 'Jordan - AI Project Manager',
            email: 'jordan@ai-sdlc.dev'
          }
        });

        filesCreated.push(file.path);
        console.log(`✅ Created: ${file.path}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        if (error.status === 422) {
          console.log(`⚠️ File already exists: ${file.path}`);
        } else {
          console.error(`❌ Failed to create ${file.path}:`, error.message);
        }
      }
    }

    const summary = `🎉 **AI-SDLC Document Structure Created Successfully!**

**Project:** ${projectName}
**Repository:** https://github.com/${owner}/${repo}

**📁 Files Created:** ${filesCreated.length}
${filesCreated.map(file => `- ✅ ${file}`).join('\n')}

**🎯 Ready for AI-SDLC Workflow:**
- **Professional README** - Showcases AI-SDLC methodology
- **Complete Templates** - Ready for Sarah and Alex to use
- **Discussion-Based Workflow** - Human-AI collaboration framework
- **Phase Structure** - Clear progression from planning to implementation

**🚀 Next Steps:**
1. **Sarah** can start Business Case discussions using the templates
2. **Alex** can begin Architecture discussions when ready
3. **Human oversight** at each phase for approval
4. **Jordan** tracks progress through GitHub project board

Your AI-SDLC project is now fully structured and ready for collaborative development!`;

    // Update memory
    memory.updateProject({
      name: projectName,
      phase: "Document Structure Created",
      status: "Ready for AI Collaboration",
      currentFocus: "Templates and workflow established",
      githubUrl: `https://github.com/${owner}/${repo}`
    });

    return {
      success: true,
      data: {
        filesCreated,
        summary
      }
    };

  } catch (error) {
    console.error('Document structure creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function createREADME(projectName: string): string {
  return `# ${projectName}

## 🤖 AI-SDLC Methodology Project

This project follows the **AI-SDLC (AI Software Development Life Cycle)** methodology, featuring human-AI collaboration throughout the development process.

### 🎯 Project Overview

${projectName} is developed using a structured approach that combines human expertise with AI capabilities across multiple specialized roles:

- **👩‍💼 Sarah - AI Business Analyst**: Gathers requirements through collaborative discussions
- **👨‍💻 Alex - AI Architect**: Designs system architecture and technical specifications  
- **📋 Jordan - AI Project Manager**: Manages workflow, documentation, and project coordination

### 🔄 AI-SDLC Workflow

#### Phase 1: Planning & Design
1. **Business Case** - Problem definition and solution approach
2. **Requirements** - Business and user requirements gathering
3. **Architecture** - System design and technical specifications
4. **Project Structure** - Development workflow setup

#### Phase 2: Implementation
5. **Functional Requirements** - Detailed feature specifications
6. **Implementation Plan** - Development roadmap and milestones
7. **Development** - Iterative coding and testing
8. **Delivery** - Deployment and documentation

### 📚 Documentation Structure

\`\`\`
docs/
├── phase1-planning/
│   ├── business-case-template.md
│   ├── brd-template.md
│   ├── urd-template.md
│   ├── srs-template.md
│   └── add-template.md
└── phase2-implementation/
    ├── frs-template.md
    └── implementation-plan-template.md
\`\`\`

### 🚀 Getting Started

1. **Review the GitHub Project Board** for current phase and tasks
2. **Check assigned AI teammate** for each task
3. **Start collaborative discussions** to gather information
4. **Create deliverables** using the provided templates
5. **Get human approval** before proceeding to next phase

### 🎯 Key Features

- **Human-AI Collaboration**: Each phase involves discussion-based information gathering
- **Template-Driven**: Professional document templates for consistent deliverables
- **Traceability**: Full tracking from business case to implementation
- **Iterative Approach**: Continuous feedback and refinement
- **Quality Assurance**: Human oversight at every critical decision point

---

**Powered by AI-SDLC Methodology** | **Human-AI Collaborative Development**`;
}

function createDocsREADME(projectName: string): string {
  return `# ${projectName} - Documentation

## 📚 AI-SDLC Documentation Structure

This folder contains all project documentation following the AI-SDLC methodology.

### 📋 Phase 1: Planning & Design

#### Business Analysis (Sarah - AI Business Analyst)
- **business-case-template.md** - Problem definition and solution approach
- **brd-template.md** - Business Requirements Document
- **urd-template.md** - User Requirements Document

#### Technical Architecture (Alex - AI Architect)  
- **srs-template.md** - System Requirements Specification
- **add-template.md** - Architectural Design Document

### 🔧 Phase 2: Implementation

#### Functional Design
- **frs-template.md** - Functional Requirements Specification
- **implementation-plan-template.md** - Development roadmap

### 🎯 How to Use These Templates

1. **Start with Discussion** - AI teammate gathers information through conversation
2. **Collaborative Information Gathering** - Human provides context and requirements
3. **Template-Based Creation** - AI creates deliverable using appropriate template
4. **Human Review & Approval** - Quality assurance and sign-off
5. **Progress to Next Phase** - Continue AI-SDLC workflow

### 📈 Document Traceability

Each document links to the previous phase, ensuring full traceability:
- Business Case → BRD/URD → SRS/ADD → FRS → Implementation Plan

---

**AI-SDLC Methodology** - Structured Human-AI Collaboration`;
}

function createBusinessCaseTemplate(): string {
  return `# Business Case

**Project:** [Project Name]
**Date:** [Date]
**Prepared by:** Sarah - AI Business Analyst
**Status:** [Draft/Review/Approved]

## 📋 Executive Summary

[Brief overview of the business problem and proposed solution]

## 🎯 Problem Statement

### Current Situation
[Describe the current state and challenges]

### Business Impact
[Quantify the impact of not addressing this problem]

## 💡 Proposed Solution

### Solution Overview
[High-level description of the proposed solution]

### Key Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## 📊 Business Justification

### Return on Investment (ROI)
[Expected ROI and timeframe]

### Cost-Benefit Analysis
| Category | Cost | Benefit |
|----------|------|---------|
| Development | [Amount] | [Value] |
| Operations | [Amount] | [Value] |
| **Total** | **[Total Cost]** | **[Total Benefit]** |

## 🎯 Success Criteria

1. [Measurable success criterion 1]
2. [Measurable success criterion 2]
3. [Measurable success criterion 3]

## ⏱️ Timeline

| Phase | Duration | Key Milestones |
|-------|----------|----------------|
| Planning | [Duration] | [Milestones] |
| Development | [Duration] | [Milestones] |
| Deployment | [Duration] | [Milestones] |

## 🚨 Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| [Risk 1] | [High/Medium/Low] | [High/Medium/Low] | [Strategy] |
| [Risk 2] | [High/Medium/Low] | [High/Medium/Low] | [Strategy] |

## 👥 Stakeholders

| Stakeholder | Role | Involvement Level |
|-------------|------|------------------|
| [Name/Role] | [Description] | [High/Medium/Low] |

## 📝 Recommendations

[Clear recommendation and next steps]

---

**Next Phase:** Business Requirements Document (BRD)
**AI Teammate:** Sarah - AI Business Analyst
**Human Approval Required:** ✅`;
}

function createBRDTemplate(): string {
  return `# Business Requirements Document (BRD)

**Project:** [Project Name]
**Date:** [Date]
**Prepared by:** Sarah - AI Business Analyst
**Status:** [Draft/Review/Approved]
**Previous Phase:** Business Case

## 📋 Document Overview

### Purpose
[Purpose of this BRD]

### Scope
[What is included and excluded from this document]

## 🎯 Business Objectives

### Primary Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| [Metric 1] | [Target] | [How to measure] |
| [Metric 2] | [Target] | [How to measure] |

## 👥 Stakeholder Requirements

### Business Stakeholders
| Stakeholder | Requirements | Priority |
|-------------|--------------|----------|
| [Role] | [Requirement] | [High/Medium/Low] |

### End Users
| User Type | Requirements | Priority |
|-----------|--------------|----------|
| [User Type] | [Requirement] | [High/Medium/Low] |

## 📋 Functional Requirements

### Core Business Functions
1. **[Function Name]**
   - Description: [Description]
   - Business Rule: [Rule]
   - Acceptance Criteria: [Criteria]

2. **[Function Name]**
   - Description: [Description]
   - Business Rule: [Rule]
   - Acceptance Criteria: [Criteria]

## 🔧 Non-Functional Requirements

### Performance Requirements
- [Performance requirement 1]
- [Performance requirement 2]

### Security Requirements
- [Security requirement 1]
- [Security requirement 2]

### Compliance Requirements
- [Compliance requirement 1]
- [Compliance requirement 2]

## 🔄 Business Process Flow

[Describe key business processes and workflows]

## 📊 Data Requirements

### Data Entities
| Entity | Description | Source | Usage |
|--------|-------------|--------|-------|
| [Entity] | [Description] | [Source] | [Usage] |

## 🚨 Constraints and Assumptions

### Business Constraints
- [Constraint 1]
- [Constraint 2]

### Assumptions
- [Assumption 1]
- [Assumption 2]

---

**Next Phase:** User Requirements Document (URD)
**AI Teammate:** Sarah - AI Business Analyst
**Human Approval Required:** ✅`;
}
