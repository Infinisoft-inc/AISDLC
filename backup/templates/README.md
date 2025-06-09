# AI-SDLC Templates

This directory contains all the templates used in the AI-SDLC methodology, organized by phase and integration type.

## Directory Structure

### Phase 1: Planning Templates (`phase1-planning/`)
Strategic and architectural planning documents:
- `business-case.md` - Business case document template
- `brd.md` - Business Requirements Document template
- `urd.md` - User Requirements Document template
- `srs.md` - System Requirements Specification template (Domain-Driven)
- `add.md` - Architectural Design Document template (C4 Model)

### Phase 2: Implementation Templates (`phase2-implementation/`)
Feature development and implementation documents:
- `frs.md` - Functional Requirements Specification template
- `implementation-plan.md` - Implementation plan template

### GitHub Integration Templates (`github-integration/`)
GitHub issue templates for project management:
- `epic-issue.md` - Epic issue template (Domain-level)
- `feature-issue.md` - Feature issue template
- `task-issue.md` - Task issue template

### Support Templates (Root Level)
General project support documents:
- `project-context.md` - Project context tracking template
- `test-report.md` - Test report template
- `deployment-guide.md` - Deployment guide template
- `blog-article.md` - Blog article template

## Template Relationships

**AI-SDLC Methodology Flow:**
```
Phase 1: Business Case → BRD → URD → SRS → ADD
Phase 2: FRS → Implementation Plan
GitHub:  Epic → Feature → Task
```

**Traceability Chain:**
```
CAP-001 → BR-001 → US-001 → SR-001 → FRS → Implementation Plan
```

## Usage Notes

- **Phase 1 templates** are used for strategic planning and architecture
- **Phase 2 templates** are used for iterative feature development (vertical approach)
- **GitHub templates** are used by project managers for issue tracking
- All templates include clear traceability links to avoid duplication


