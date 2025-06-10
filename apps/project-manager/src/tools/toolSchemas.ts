/**
 * Tool Schemas
 * Single responsibility: Define all MCP tool schemas
 */

export const toolSchemas = [
  {
    name: "complete-training",
    description: "Complete Jordan's AI-SDLC methodology training",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "process-message-for-jordan",
    description: "Process a message designated for Jordan and return enhanced prompt for LLM response",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Message designated for Jordan",
        },
        context: {
          type: "string",
          description: "Context for the conversation (optional)",
          default: "general"
        },
      },
      required: ["message"],
    },
  },
  {
    name: "get-project-status",
    description: "Get current project status and Jordan's memory",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "create-project-structure",
    description: "Create GitHub project structure from SRS requirements",
    inputSchema: {
      type: "object",
      properties: {
        projectName: {
          type: "string",
          description: "Name of the project",
        },
        srsContent: {
          type: "string",
          description: "SRS content with domains and functional requirements",
        },
        organization: {
          type: "string",
          description: "GitHub organization (optional)",
          default: "Infinisoft-inc"
        },
      },
      required: ["projectName", "srsContent"],
    },
  },
  {
    name: "create-epic-issue",
    description: "Create a single Epic issue in an existing repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (organization or user)",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        title: {
          type: "string",
          description: "Epic title (will be prefixed with [EPIC] if not present)",
        },
        body: {
          type: "string",
          description: "Epic description and requirements",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to add to the epic",
          default: ["epic"]
        },
        organization: {
          type: "string",
          description: "GitHub organization (optional)",
          default: "Infinisoft-inc"
        },
      },
      required: ["owner", "repo", "title", "body"],
    },
  },
  {
    name: "create-feature-issue",
    description: "Create a single Feature issue linked to an Epic",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        title: {
          type: "string",
          description: "Feature title (will be prefixed with [FEATURE] if not present)",
        },
        body: {
          type: "string",
          description: "Feature description and acceptance criteria",
        },
        parentEpicNumber: {
          type: "number",
          description: "Epic issue number to link this feature to",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to add to the feature",
          default: ["feature"]
        },
        organization: {
          type: "string",
          description: "GitHub organization (optional)",
          default: "Infinisoft-inc"
        },
      },
      required: ["owner", "repo", "title", "body", "parentEpicNumber"],
    },
  },
  {
    name: "create-task-issue",
    description: "Create a single Task issue linked to a Feature",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        title: {
          type: "string",
          description: "Task title (will be prefixed with [TASK] if not present)",
        },
        body: {
          type: "string",
          description: "Task description and implementation details",
        },
        parentFeatureNumber: {
          type: "number",
          description: "Feature issue number to link this task to",
        },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to add to the task",
          default: ["task"]
        },
        organization: {
          type: "string",
          description: "GitHub organization (optional)",
          default: "Infinisoft-inc"
        },
      },
      required: ["owner", "repo", "title", "body", "parentFeatureNumber"],
    },
  },
];
