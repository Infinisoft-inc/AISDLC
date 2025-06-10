/**
 * Document Links
 * Single responsibility: Create permalinks between issues and documents
 */

export interface DocumentLink {
  title: string;
  path: string;
  description: string;
  phase: string;
}

/**
 * Get document links for different types of issues
 */
export function getDocumentLinks(owner: string, repo: string): Record<string, DocumentLink[]> {
  const baseUrl = `https://github.com/${owner}/${repo}/blob/main`;
  
  return {
    'business-case': [
      {
        title: '📄 Business Case Template',
        path: `${baseUrl}/docs/phase1-planning/business-case-template.md`,
        description: 'Complete business case template with problem definition and solution approach',
        phase: '1.1'
      }
    ],
    'requirements': [
      {
        title: '📋 Business Requirements Document (BRD)',
        path: `${baseUrl}/docs/phase1-planning/brd-template.md`,
        description: 'Business requirements template for stakeholder needs',
        phase: '1.2'
      },
      {
        title: '👥 User Requirements Document (URD)',
        path: `${baseUrl}/docs/phase1-planning/urd-template.md`,
        description: 'User requirements template for user stories and acceptance criteria',
        phase: '1.2'
      }
    ],
    'architecture': [
      {
        title: '🏗️ System Requirements Specification (SRS)',
        path: `${baseUrl}/docs/phase1-planning/srs-template.md`,
        description: 'Domain-driven system requirements specification',
        phase: '1.3'
      },
      {
        title: '🏛️ Architectural Design Document (ADD)',
        path: `${baseUrl}/docs/phase1-planning/add-template.md`,
        description: 'C4 model architectural design with technical specifications',
        phase: '1.3'
      }
    ],
    'functional-design': [
      {
        title: '⚙️ Functional Requirements Specification (FRS)',
        path: `${baseUrl}/docs/phase2-implementation/frs-template.md`,
        description: 'Detailed functional requirements for implementation',
        phase: '2.1'
      }
    ],
    'implementation': [
      {
        title: '🚀 Implementation Plan',
        path: `${baseUrl}/docs/phase2-implementation/implementation-plan-template.md`,
        description: 'Development roadmap and implementation strategy',
        phase: '2.2'
      }
    ],
    'project-structure': [
      {
        title: '📚 Documentation Overview',
        path: `${baseUrl}/docs/README.md`,
        description: 'Complete AI-SDLC documentation structure and guidelines',
        phase: '1.4'
      },
      {
        title: '🎯 Project README',
        path: `${baseUrl}/README.md`,
        description: 'Main project overview with AI-SDLC methodology',
        phase: '1.4'
      }
    ]
  };
}

/**
 * Create document links section for issue body
 */
export function createDocumentLinksSection(
  owner: string, 
  repo: string, 
  linkType: string
): string {
  const documentLinks = getDocumentLinks(owner, repo);
  const links = documentLinks[linkType] || [];
  
  if (links.length === 0) {
    return '';
  }
  
  let section = '\n\n## 📎 Related Documents\n\n';
  
  links.forEach(link => {
    section += `### ${link.title}\n`;
    section += `**🔗 [Open Document](${link.path})**\n\n`;
    section += `${link.description}\n\n`;
    section += `**Phase:** ${link.phase}\n\n`;
    section += '---\n\n';
  });
  
  return section;
}

/**
 * Create comprehensive document navigation for project
 */
export function createProjectDocumentNavigation(owner: string, repo: string): string {
  const baseUrl = `https://github.com/${owner}/${repo}/blob/main`;
  
  return `
## 📚 Project Documentation Navigation

### 📋 Phase 1: Planning & Design
- **[📄 Business Case](${baseUrl}/docs/phase1-planning/business-case-template.md)** - Problem definition and solution approach
- **[📋 Business Requirements (BRD)](${baseUrl}/docs/phase1-planning/brd-template.md)** - Stakeholder requirements
- **[👥 User Requirements (URD)](${baseUrl}/docs/phase1-planning/urd-template.md)** - User stories and acceptance criteria
- **[🏗️ System Requirements (SRS)](${baseUrl}/docs/phase1-planning/srs-template.md)** - Domain-driven system design
- **[🏛️ Architecture Design (ADD)](${baseUrl}/docs/phase1-planning/add-template.md)** - C4 model architecture

### 🔧 Phase 2: Implementation
- **[⚙️ Functional Requirements (FRS)](${baseUrl}/docs/phase2-implementation/frs-template.md)** - Detailed functional specs
- **[🚀 Implementation Plan](${baseUrl}/docs/phase2-implementation/implementation-plan-template.md)** - Development roadmap

### 📖 Documentation Hub
- **[📚 Documentation Overview](${baseUrl}/docs/README.md)** - Complete documentation guide
- **[🎯 Project README](${baseUrl}/README.md)** - Main project overview

---

**💡 Tip:** Click any document link above to view the template or completed document.
`;
}

/**
 * Get appropriate document links based on task type
 */
export function getTaskDocumentLinks(taskTitle: string, owner: string, repo: string): string {
  const title = taskTitle.toLowerCase();
  
  if (title.includes('business case')) {
    return createDocumentLinksSection(owner, repo, 'business-case');
  } else if (title.includes('requirements')) {
    return createDocumentLinksSection(owner, repo, 'requirements');
  } else if (title.includes('architecture') || title.includes('design')) {
    return createDocumentLinksSection(owner, repo, 'architecture');
  } else if (title.includes('functional')) {
    return createDocumentLinksSection(owner, repo, 'functional-design');
  } else if (title.includes('implementation')) {
    return createDocumentLinksSection(owner, repo, 'implementation');
  } else if (title.includes('project structure')) {
    return createDocumentLinksSection(owner, repo, 'project-structure');
  }
  
  return '';
}
