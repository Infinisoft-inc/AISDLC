/**
 * AI Teammate Memory System - Persistent, Intelligent Memory Management
 * Handles conversation history, project tracking, and team coordination
 * Generic system for all AI teammates
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

export interface ConversationEntry {
  timestamp: string;
  speaker: 'human' | 'ai_teammate';
  message: string;
  context: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProjectContext {
  name: string;
  phase: string;
  status: string;
  lastUpdated: string;
  keyDecisions: string[];
  nextSteps: string[];
  milestones: string[];
  epics: string[];
  currentFocus: string;
}

export interface UserProfile {
  name: string;
  communicationStyle: string;
  preferences: string[];
  workingRelationship: string;
  lastInteraction: string;
}

export interface TeamCoordination {
  activeTeamMembers: string[];
  pendingHandoffs: string[];
  blockers: string[];
  dependencies: string[];
}

export interface AITeammateMemory {
  identity: {
    name: string;
    role: string;
    personality: string;
    capabilities: string[];
  };
  user: UserProfile;
  currentProject: ProjectContext | null;
  teamCoordination: TeamCoordination;
  conversations: ConversationEntry[];
  learnings: string[];
  pendingQuestions: string[];
  projectStructureProgress: {
    completed: string[];
    missing: string[];
    currentFocus: string;
  };
  aisdlcTraining: {
    completed: boolean;
    methodologyUnderstanding: string[];
    roleSpecificKnowledge: string[];
    lastTrainingUpdate: string;
  };
}

export class AITeammateMemoryManager {
  private memoryPath: string;
  private memory: AITeammateMemory;
  private teammateName: string;

  constructor(teammateName: string, memoryPath?: string) {
    this.teammateName = teammateName;
    this.memoryPath = memoryPath || `./memory/${teammateName.toLowerCase()}-memory.json`;
    this.memory = this.loadMemory();
  }

  private loadMemory(): AITeammateMemory {
    if (existsSync(this.memoryPath)) {
      try {
        const data = readFileSync(this.memoryPath, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.warn('Failed to load memory, creating new one');
      }
    }

    return this.createDefaultMemory();
  }

  private createDefaultMemory(): AITeammateMemory {
    return {
      identity: {
        name: this.teammateName,
        role: "AI Teammate",
        personality: "Professional, Helpful, Intelligent",
        capabilities: [
          "Natural conversation",
          "Context-aware responses",
          "Persistent memory",
          "AI-SDLC methodology"
        ]
      },
      user: {
        name: "",
        communicationStyle: "",
        preferences: [],
        workingRelationship: "new",
        lastInteraction: ""
      },
      currentProject: null,
      teamCoordination: {
        activeTeamMembers: [],
        pendingHandoffs: [],
        blockers: [],
        dependencies: []
      },
      conversations: [],
      learnings: [],
      pendingQuestions: [],
      projectStructureProgress: {
        completed: [],
        missing: [],
        currentFocus: ""
      },
      aisdlcTraining: {
        completed: false,
        methodologyUnderstanding: [],
        roleSpecificKnowledge: [],
        lastTrainingUpdate: ""
      }
    };
  }

  saveMemory(): void {
    try {
      // Ensure memory directory exists
      const memoryDir = this.memoryPath.substring(0, this.memoryPath.lastIndexOf('/'));
      if (!existsSync(memoryDir)) {
        mkdirSync(memoryDir, { recursive: true });
      }
      
      writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  addConversation(speaker: 'human' | 'ai_teammate', message: string, context: string, importance: ConversationEntry['importance'] = 'medium'): void {
    this.memory.conversations.push({
      timestamp: new Date().toISOString(),
      speaker,
      message,
      context,
      importance
    });
    
    // Keep only last 100 conversations to manage size
    if (this.memory.conversations.length > 100) {
      this.memory.conversations = this.memory.conversations.slice(-100);
    }
    
    this.saveMemory();
  }

  addLearning(learning: string): void {
    if (!this.memory.learnings.includes(learning)) {
      this.memory.learnings.push(learning);
      this.saveMemory();
    }
  }

  updateUser(updates: Partial<UserProfile>): void {
    this.memory.user = { ...this.memory.user, ...updates };
    this.memory.user.lastInteraction = new Date().toISOString();
    this.saveMemory();
  }

  updateProject(project: Partial<ProjectContext>): void {
    if (this.memory.currentProject) {
      this.memory.currentProject = { ...this.memory.currentProject, ...project };
    } else {
      this.memory.currentProject = {
        name: project.name || 'Unknown Project',
        phase: project.phase || 'Project Setup',
        status: project.status || 'Active',
        lastUpdated: new Date().toISOString(),
        keyDecisions: project.keyDecisions || [],
        nextSteps: project.nextSteps || [],
        milestones: project.milestones || [],
        epics: project.epics || [],
        currentFocus: project.currentFocus || 'Project Structure Creation'
      };
    }
    this.saveMemory();
  }

  updateTeamCoordination(updates: Partial<TeamCoordination>): void {
    this.memory.teamCoordination = { ...this.memory.teamCoordination, ...updates };
    this.saveMemory();
  }

  addPendingQuestion(question: string): void {
    if (!this.memory.pendingQuestions.includes(question)) {
      this.memory.pendingQuestions.push(question);
      this.saveMemory();
    }
  }

  removePendingQuestion(question: string): void {
    this.memory.pendingQuestions = this.memory.pendingQuestions.filter(q => q !== question);
    this.saveMemory();
  }

  updateProjectStructureProgress(completed?: string[], missing?: string[], currentFocus?: string): void {
    if (completed) this.memory.projectStructureProgress.completed = completed;
    if (missing) this.memory.projectStructureProgress.missing = missing;
    if (currentFocus) this.memory.projectStructureProgress.currentFocus = currentFocus;
    this.saveMemory();
  }

  updateAISDLCTraining(updates: Partial<AITeammateMemory['aisdlcTraining']>): void {
    this.memory.aisdlcTraining = { 
      ...this.memory.aisdlcTraining, 
      ...updates,
      lastTrainingUpdate: new Date().toISOString()
    };
    this.saveMemory();
  }

  getMemory(): AITeammateMemory {
    return this.memory;
  }

  getRecentConversations(count: number = 10): ConversationEntry[] {
    return this.memory.conversations.slice(-count);
  }

  getImportantConversations(): ConversationEntry[] {
    return this.memory.conversations.filter(c => c.importance === 'high' || c.importance === 'critical');
  }

  // Generate context summary for AI processing
  generateContextSummary(): string {
    const user = this.memory.user;
    const project = this.memory.currentProject;
    const recentConversations = this.getRecentConversations(5);
    const importantLearnings = this.memory.learnings.slice(-10);
    const training = this.memory.aisdlcTraining;

    return `
${this.memory.identity.name.toUpperCase()}'S CONTEXT SUMMARY:
========================

IDENTITY:
- Name: ${this.memory.identity.name}
- Role: ${this.memory.identity.role}
- Personality: ${this.memory.identity.personality}

USER RELATIONSHIP:
- Name: ${user.name || 'Unknown'}
- Communication Style: ${user.communicationStyle || 'Not yet determined'}
- Working Relationship: ${user.workingRelationship}
- Last Interaction: ${user.lastInteraction || 'Never'}

CURRENT PROJECT:
${project ? `
- Name: ${project.name}
- Phase: ${project.phase}
- Status: ${project.status}
- Current Focus: ${project.currentFocus}
- Milestones: ${project.milestones.length} created
- EPICs: ${project.epics.length} created
` : '- No active project'}

AI-SDLC TRAINING STATUS:
- Completed: ${training.completed ? 'Yes' : 'No'}
- Methodology Understanding: ${training.methodologyUnderstanding.length} concepts learned
- Role Knowledge: ${training.roleSpecificKnowledge.length} skills acquired

TEAM COORDINATION:
- Active Team Members: ${this.memory.teamCoordination.activeTeamMembers.join(', ') || 'None'}
- Pending Handoffs: ${this.memory.teamCoordination.pendingHandoffs.length}
- Blockers: ${this.memory.teamCoordination.blockers.length}

RECENT LEARNINGS:
${importantLearnings.map(l => `- ${l}`).join('\n')}

RECENT CONVERSATIONS:
${recentConversations.map(c => `[${c.timestamp}] ${c.speaker}: ${c.message.substring(0, 100)}...`).join('\n')}
`;
  }
}
