/**
 * GitHub Projects V2 functionality
 * Enhanced with AI Teammate assignment capabilities
 */

// Project field management
export {
  createProjectField,
  createAITeammateField,
  getProjectFields,
  findAITeammateField,
  type ProjectFieldData,
  type ProjectFieldOption,
  type ProjectFieldResponse
} from './createProjectField.js';

// AI teammate assignment
export {
  assignAITeammate,
  getAIAssignments,
  getAllAIAssignments,
  type AITeammate,
  type ProjectItemAssignment,
  type AssignmentResult
} from './assignAITeammate.js';
