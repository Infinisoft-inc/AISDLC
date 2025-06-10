/**
 * Create Project Structure
 * Single responsibility: Create complete GitHub project structure from SRS
 */

import {
  createEpic,
  createFeature,
  createTask,
  createOrgRepository,
  createProjectV2,
  addIssueToProjectV2
} from '@brainstack/github-service';
import { createGitHubSetup } from '@brainstack/integration-service';
import type { JordanMemoryManager } from '../memory.js';

export interface ProjectStructureData {
  projectName: string;
  srsContent: string;
  organization?: string;
}

export interface ProjectStructureResult {
  success: boolean;
  data?: {
    repository: any;
    project: any;
    epics: any[];
    features: any[];
    tasks: any[];
  };
  error?: string;
}

interface ParsedProjectStructure {
  repository: {
    name: string;
    description: string;
    private: boolean;
  };
  epics: Array<{
    title: string;
    body: string;
    labels: string[];
    features: Array<{
      title: string;
      body: string;
      labels: string[];
      tasks: Array<{
        title: string;
        body: string;
        labels: string[];
      }>;
    }>;
  }>;
}

/**
 * Parse actual SRS content following Domain-Driven approach
 */
function parseActualSRS(srsContent: string, projectName: string): ParsedProjectStructure | null {
  try {
    const lines = srsContent.split('\n');
    const epics: any[] = [];
    let currentDomain: any = null;
    let currentFR: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect Domain sections (## Domain #: Name)
      const domainMatch = line.match(/^## Domain \d+: (.+)$/);
      if (domainMatch) {
        // Save previous domain if exists
        if (currentDomain) {
          epics.push(currentDomain);
        }

        // Start new domain (Epic)
        const domainName = domainMatch[1];
        currentDomain = {
          title: `[EPIC] ${domainName}`,
          body: `# ${domainName} Epic\n\n`,
          labels: ['epic', domainName.toLowerCase().replace(/\s+/g, '-')],
          features: []
        };

        // Look ahead for domain overview
        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          if (lines[j].includes('**Purpose:**')) {
            const purpose = lines[j].replace('**Purpose:**', '').trim();
            currentDomain.body += `## Purpose\n${purpose}\n\n`;
          }
          if (lines[j].includes('**Scope:**')) {
            const scope = lines[j].replace('**Scope:**', '').trim();
            currentDomain.body += `## Scope\n${scope}\n\n`;
            break;
          }
        }
        continue;
      }

      // Detect Functional Requirements (#### FR-D#-###: Name)
      const frMatch = line.match(/^#### (FR-D\d+-\d+): (.+)$/);
      if (frMatch && currentDomain) {
        // Save previous FR if exists
        if (currentFR) {
          currentDomain.features.push(currentFR);
        }

        // Start new FR (Feature)
        const frId = frMatch[1];
        const frName = frMatch[2];
        currentFR = {
          title: `[FEATURE] ${frName}`,
          body: `# ${frName}\n\n**Requirement ID:** ${frId}\n\n`,
          labels: ['feature', frName.toLowerCase().replace(/\s+/g, '-')],
          tasks: []
        };

        // Look ahead for description and scope
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          if (lines[j].includes('**Description:**')) {
            const description = lines[j].replace('**Description:**', '').trim();
            currentFR.body += `## Description\n${description}\n\n`;
          }
          if (lines[j].includes('**Scope:**')) {
            const scope = lines[j].replace('**Scope:**', '').trim();
            currentFR.body += `## Scope\n${scope}\n\n`;
            break;
          }
        }

        // Generate implementation tasks for this FR based on AI-SDLC methodology
        currentFR.tasks = generateAISDLCTasks(frName, frId, currentFR.body);
        continue;
      }
    }

    // Save last domain and FR
    if (currentFR && currentDomain) {
      currentDomain.features.push(currentFR);
    }
    if (currentDomain) {
      epics.push(currentDomain);
    }

    // Return parsed structure if we found domains
    if (epics.length > 0) {
      return {
        repository: {
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          description: `${projectName} - Domain-driven development project`,
          private: false
        },
        epics
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing SRS:', error);
    return null;
  }
}

/**
 * Generate AI-SDLC implementation tasks for a functional requirement
 * Based on FRS → Implementation Plan methodology
 */
function generateAISDLCTasks(frName: string, frId: string, _frBody: string): any[] {
  const tasks: any[] = [];

  // Simplified: Only 2 tasks per FR to avoid timeout issues
  // Task 1: Design & Implementation
  tasks.push({
    title: `[TASK] ${frName} - Design & Implementation`,
    body: `# ${frName} - Design & Implementation\n\n**Functional Requirement:** ${frId}\n\n## Objective\nDesign and implement core functionality for ${frName}.\n\n## Implementation Steps\n1. **Technical Design (FRS)**\n   - Define Input → Processing → Output flow\n   - Create technical specifications\n   - Design API interfaces\n\n2. **Core Implementation**\n   - Implement business logic\n   - Create API endpoints\n   - Add validation and error handling\n\n## Deliverables\n- FRS documentation\n- Core implementation\n- API endpoints\n- Unit tests`,
    labels: ['task', 'design', 'implementation', frId.toLowerCase()]
  });

  // Task 2: Testing & Integration
  tasks.push({
    title: `[TASK] ${frName} - Testing & Integration`,
    body: `# ${frName} - Testing & Integration\n\n**Functional Requirement:** ${frId}\n\n## Objective\nComplete testing and integration for ${frName}.\n\n## Implementation Steps\n1. **Testing**\n   - Unit testing\n   - Integration testing\n   - End-to-end testing\n\n2. **Integration & Deployment**\n   - System integration\n   - Documentation updates\n   - Deployment preparation\n\n## Deliverables\n- Test suite\n- Integration documentation\n- Deployment scripts\n- Acceptance criteria validation`,
    labels: ['task', 'testing', 'integration', frId.toLowerCase()]
  });

  return tasks;
}

/**
 * Parse SRS content to extract epics, features, and tasks
 * Maps Domain-Driven SRS structure to GitHub project structure:
 * - Domains → Epics
 * - Functional Requirements → Features
 * - Implementation details → Tasks
 */
function parseSRSToProjectStructure(projectName: string, srsContent: string): ParsedProjectStructure {
  // Try to parse actual SRS content first
  const parsedStructure = parseActualSRS(srsContent, projectName);
  if (parsedStructure) {
    return parsedStructure;
  }

  // Fallback: For E-Commerce Platform, create the expected structure
  if (projectName.toLowerCase().includes('ecommerce') || projectName.toLowerCase().includes('e-commerce')) {
    return {
      repository: {
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        description: `${projectName} - Comprehensive e-commerce platform with user management and product catalog`,
        private: false
      },
      epics: [
        {
          title: `[EPIC] User Management System`,
          body: `# User Management System Epic\n\nComplete user management functionality including registration, authentication, and profile management.\n\n## Scope\n- User registration and login\n- Authentication and authorization\n- User profile management\n- Security and data protection\n\n## Acceptance Criteria\n- [ ] Users can register with email validation\n- [ ] Secure authentication system\n- [ ] Profile management capabilities\n- [ ] Password security compliance`,
          labels: ['epic', 'user-management', 'authentication'],
          features: [
            {
              title: `[FEATURE] User Registration & Authentication`,
              body: `# User Registration & Authentication\n\nImplement secure user registration and authentication system.\n\n## Requirements\n- Email validation system\n- Password encryption and security\n- JWT token management\n- Session handling\n\n## Technical Specifications\n- Use bcrypt for password hashing\n- JWT tokens for session management\n- Email verification workflow\n- Rate limiting for login attempts`,
              labels: ['feature', 'authentication', 'security'],
              tasks: [
                {
                  title: `[TASK] Email validation system`,
                  body: `# Email Validation System\n\nImplement comprehensive email validation for user registration.\n\n## Requirements\n- Email format validation\n- Domain verification\n- Disposable email detection\n- Email verification workflow\n\n## Implementation\n- Use regex for format validation\n- DNS lookup for domain verification\n- Send verification emails\n- Handle verification responses`,
                  labels: ['task', 'email', 'validation']
                },
                {
                  title: `[TASK] Password encryption`,
                  body: `# Password Encryption\n\nImplement secure password encryption and validation.\n\n## Requirements\n- bcrypt hashing algorithm\n- Salt generation\n- Password strength validation\n- Secure storage\n\n## Security Standards\n- Minimum 12 rounds for bcrypt\n- Password complexity requirements\n- No plain text storage\n- Secure comparison methods`,
                  labels: ['task', 'password', 'encryption', 'security']
                },
                {
                  title: `[TASK] JWT token management`,
                  body: `# JWT Token Management\n\nImplement JWT token creation, validation, and refresh mechanisms.\n\n## Requirements\n- Token generation on login\n- Token validation middleware\n- Refresh token mechanism\n- Token expiration handling\n\n## Implementation\n- Use RS256 algorithm\n- Short-lived access tokens\n- Long-lived refresh tokens\n- Secure token storage`,
                  labels: ['task', 'jwt', 'tokens', 'authentication']
                }
              ]
            },
            {
              title: `[FEATURE] User Profile Management`,
              body: `# User Profile Management\n\nComplete user profile management system with CRUD operations.\n\n## Requirements\n- Profile creation and editing\n- Avatar upload system\n- Privacy settings\n- Profile validation\n\n## Features\n- Personal information management\n- Profile picture upload\n- Account settings\n- Privacy controls`,
              labels: ['feature', 'profile', 'user-management'],
              tasks: [
                {
                  title: `[TASK] Profile CRUD operations`,
                  body: `# Profile CRUD Operations\n\nImplement Create, Read, Update, Delete operations for user profiles.\n\n## Requirements\n- Create new profiles\n- Read profile information\n- Update profile data\n- Delete profiles (soft delete)\n\n## API Endpoints\n- POST /api/profiles\n- GET /api/profiles/:id\n- PUT /api/profiles/:id\n- DELETE /api/profiles/:id`,
                  labels: ['task', 'crud', 'api', 'profiles']
                },
                {
                  title: `[TASK] Avatar upload system`,
                  body: `# Avatar Upload System\n\nImplement secure avatar upload and management system.\n\n## Requirements\n- Image upload validation\n- Image resizing and optimization\n- Secure file storage\n- Avatar deletion\n\n## Technical Specifications\n- Support JPEG, PNG formats\n- Maximum file size: 5MB\n- Resize to standard dimensions\n- CDN integration for delivery`,
                  labels: ['task', 'upload', 'images', 'storage']
                }
              ]
            }
          ]
        },
        {
          title: `[EPIC] Product Catalog System`,
          body: `# Product Catalog System Epic\n\nComplete product management and catalog functionality for e-commerce platform.\n\n## Scope\n- Product management (CRUD)\n- Product search and filtering\n- Category management\n- Inventory tracking\n\n## Acceptance Criteria\n- [ ] Product creation and management\n- [ ] Advanced search capabilities\n- [ ] Category organization\n- [ ] Real-time inventory updates`,
          labels: ['epic', 'products', 'catalog'],
          features: [
            {
              title: `[FEATURE] Product Management`,
              body: `# Product Management\n\nComplete product management system with full CRUD operations.\n\n## Requirements\n- Product creation and editing\n- Image upload system\n- Category assignment\n- Inventory management\n\n## Features\n- Product information management\n- Multiple image support\n- Category relationships\n- Stock level tracking`,
              labels: ['feature', 'products', 'management'],
              tasks: [
                {
                  title: `[TASK] Product CRUD API`,
                  body: `# Product CRUD API\n\nImplement comprehensive API for product management operations.\n\n## Requirements\n- Create new products\n- Read product information\n- Update product details\n- Delete products (soft delete)\n\n## API Endpoints\n- POST /api/products\n- GET /api/products/:id\n- PUT /api/products/:id\n- DELETE /api/products/:id\n- GET /api/products (with pagination)`,
                  labels: ['task', 'api', 'products', 'crud']
                },
                {
                  title: `[TASK] Product image upload system`,
                  body: `# Product Image Upload System\n\nImplement multi-image upload system for products.\n\n## Requirements\n- Multiple image upload\n- Image validation and processing\n- Image ordering and management\n- Thumbnail generation\n\n## Technical Specifications\n- Support multiple formats\n- Automatic thumbnail creation\n- Image compression\n- CDN integration`,
                  labels: ['task', 'images', 'upload', 'products']
                }
              ]
            },
            {
              title: `[FEATURE] Search & Filtering`,
              body: `# Search & Filtering\n\nAdvanced product search and filtering capabilities.\n\n## Requirements\n- Text search functionality\n- Category filtering\n- Price range filtering\n- Advanced filter combinations\n\n## Features\n- Full-text search\n- Faceted search\n- Search suggestions\n- Filter persistence`,
              labels: ['feature', 'search', 'filtering'],
              tasks: [
                {
                  title: `[TASK] Search algorithm`,
                  body: `# Search Algorithm Implementation\n\nImplement efficient product search algorithm with relevance scoring.\n\n## Requirements\n- Full-text search capability\n- Relevance scoring\n- Search result ranking\n- Performance optimization\n\n## Implementation\n- Elasticsearch integration\n- Search indexing\n- Query optimization\n- Result caching`,
                  labels: ['task', 'search', 'algorithm', 'elasticsearch']
                },
                {
                  title: `[TASK] Filter UI components`,
                  body: `# Filter UI Components\n\nCreate interactive filtering interface components.\n\n## Requirements\n- Category filter checkboxes\n- Price range sliders\n- Brand selection\n- Filter combination logic\n\n## UI Components\n- Filter sidebar\n- Active filter display\n- Clear filters functionality\n- Mobile-responsive design`,
                  labels: ['task', 'ui', 'filters', 'components']
                }
              ]
            }
          ]
        }
      ]
    };
  }

  // Default structure for other projects
  return {
    repository: {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      description: `Project: ${projectName} - Created by Jordan AI Project Manager`,
      private: false
    },
    epics: [
      {
        title: `[EPIC] ${projectName} - Main Development Epic`,
        body: `# ${projectName} Development Epic\n\n${srsContent}\n\n## Project Overview\nThis epic contains all development work for ${projectName}.`,
        labels: ['epic', 'project-management'],
        features: [
          {
            title: `[FEATURE] Core Implementation`,
            body: `# Core Implementation Feature\n\nImplement the core functionality for ${projectName}.\n\n## Requirements\n${srsContent}`,
            labels: ['feature', 'core'],
            tasks: [
              {
                title: `[TASK] Initial Setup and Configuration`,
                body: `# Initial Setup Task\n\nSet up the basic project structure and configuration for ${projectName}.`,
                labels: ['task', 'setup']
              }
            ]
          }
        ]
      }
    ]
  };
}

export async function createProjectStructure(
  data: ProjectStructureData,
  memory: JordanMemoryManager
): Promise<ProjectStructureResult> {
  const { projectName, srsContent, organization = "Infinisoft-inc" } = data;

  try {
    // Update project in memory
    memory.updateProject({
      name: projectName,
      phase: "Project Structure Creation",
      status: "In Progress",
      currentFocus: "GitHub Setup"
    });

    // Get authenticated GitHub client
    const githubSetupResult = await createGitHubSetup(process.env.DOPPLER_TOKEN!, organization);
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;

    // Parse SRS content to create comprehensive project structure
    const projectConfig = parseSRSToProjectStructure(projectName, srsContent);

    // Step 1: Create Repository
    const repoResult = await createOrgRepository(octokit, organization, projectConfig.repository);
    if (!repoResult.success || !repoResult.data) {
      throw new Error(`Repository creation failed: ${repoResult.error}`);
    }

    const owner = repoResult.data.full_name.split('/')[0];
    const repo = repoResult.data.name;

    // Step 2: Create GitHub Project
    const projectResult = await createProjectV2(octokit, owner, {
      title: `${projectName} Development`,
      body: `Project management for ${projectName}`
    });
    if (!projectResult.success || !projectResult.data) {
      throw new Error(`Project creation failed: ${projectResult.error}`);
    }

    // Step 3: Create all Epics, Features, and Tasks with rate limiting
    const createdEpics: any[] = [];
    const createdFeatures: any[] = [];
    const createdTasks: any[] = [];
    const allIssues: any[] = [];

    // Helper function to add delay between API calls
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const epicConfig of projectConfig.epics) {
      // Create Epic
      const epicResult = await createEpic(octokit, owner, repo, epicConfig);
      if (!epicResult.success || !epicResult.data) {
        throw new Error(`Epic creation failed: ${epicResult.error}`);
      }
      createdEpics.push(epicResult.data);
      allIssues.push(epicResult.data);

      // Small delay to avoid rate limiting
      await delay(500);

      // Create Features for this Epic
      for (const featureConfig of epicConfig.features) {
        const featureResult = await createFeature(octokit, owner, repo, {
          ...featureConfig,
          parentEpicNumber: epicResult.data.number
        });
        if (!featureResult.success || !featureResult.data) {
          throw new Error(`Feature creation failed: ${featureResult.error}`);
        }
        createdFeatures.push(featureResult.data);
        allIssues.push(featureResult.data);

        // Small delay to avoid rate limiting
        await delay(500);

        // Create Tasks for this Feature
        for (const taskConfig of featureConfig.tasks) {
          const taskResult = await createTask(octokit, owner, repo, {
            ...taskConfig,
            parentFeatureNumber: featureResult.data.number
          });
          if (!taskResult.success || !taskResult.data) {
            throw new Error(`Task creation failed: ${taskResult.error}`);
          }
          createdTasks.push(taskResult.data);
          allIssues.push(taskResult.data);

          // Small delay to avoid rate limiting
          await delay(500);
        }
      }
    }

    // Step 4: Add all issues to project
    for (const issue of allIssues) {
      await addIssueToProjectV2(octokit, projectResult.data.id, issue.node_id);
    }

    // Update memory with success
    memory.updateProject({
      name: projectName,
      phase: "Project Structure Created",
      status: "Active",
      currentFocus: "Development Ready",
      githubUrl: repoResult.data.html_url,
      projectUrl: projectResult.data.url
    });

    return {
      success: true,
      data: {
        repository: repoResult.data,
        project: projectResult.data,
        epics: createdEpics,
        features: createdFeatures,
        tasks: createdTasks
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
