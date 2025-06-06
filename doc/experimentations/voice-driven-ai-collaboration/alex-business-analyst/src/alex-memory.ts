/**
 * Alex's Memory System - Persistent, Intelligent Memory Management
 * Handles conversation history, learning, and context management
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

export interface ConversationEntry {
  timestamp: string;
  speaker: 'human' | 'alex';
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
}

export interface UserProfile {
  name: string;
  communicationStyle: string;
  preferences: string[];
  workingRelationship: string;
  lastInteraction: string;
}

export interface AlexMemory {
  identity: {
    name: string;
    role: string;
    personality: string;
    capabilities: string[];
  };
  user: UserProfile;
  currentProject: ProjectContext | null;
  conversations: ConversationEntry[];
  learnings: string[];
  pendingQuestions: string[];
  businessCaseProgress: {
    completed: string[];
    missing: string[];
    currentFocus: string;
  };
}

export class AlexMemoryManager {
  private memoryPath: string;
  private memory: AlexMemory;

  constructor(memoryPath: string = './alex-memory.json') {
    this.memoryPath = memoryPath;
    this.memory = this.loadMemory();
  }

  private loadMemory(): AlexMemory {
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

  private createDefaultMemory(): AlexMemory {
    return {
      identity: {
        name: "Alex",
        role: "AI Business Analyst",
        personality: "Engaged, intelligent, persistent, results-driven",
        capabilities: [
          "Business case creation",
          "Stakeholder analysis", 
          "Requirements gathering",
          "Strategic questioning",
          "Follow-up and engagement"
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
      conversations: [],
      learnings: [],
      pendingQuestions: [],
      businessCaseProgress: {
        completed: [],
        missing: [],
        currentFocus: ""
      }
    };
  }

  saveMemory(): void {
    try {
      writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  addConversation(speaker: 'human' | 'alex', message: string, context: string, importance: ConversationEntry['importance'] = 'medium'): void {
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
        phase: project.phase || 'Planning',
        status: project.status || 'Active',
        lastUpdated: new Date().toISOString(),
        keyDecisions: project.keyDecisions || [],
        nextSteps: project.nextSteps || []
      };
    }
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

  updateBusinessCaseProgress(completed?: string[], missing?: string[], currentFocus?: string): void {
    if (completed) this.memory.businessCaseProgress.completed = completed;
    if (missing) this.memory.businessCaseProgress.missing = missing;
    if (currentFocus) this.memory.businessCaseProgress.currentFocus = currentFocus;
    this.saveMemory();
  }

  getMemory(): AlexMemory {
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

    return `
ALEX'S CONTEXT SUMMARY:
======================

USER PROFILE:
- Name: ${user.name || 'Not provided'}
- Communication Style: ${user.communicationStyle || 'Learning...'}
- Working Relationship: ${user.workingRelationship}
- Last Interaction: ${user.lastInteraction}

CURRENT PROJECT:
${project ? `
- Name: ${project.name}
- Phase: ${project.phase}
- Status: ${project.status}
- Key Decisions: ${project.keyDecisions.join(', ')}
- Next Steps: ${project.nextSteps.join(', ')}
` : 'No active project'}

BUSINESS CASE PROGRESS:
- Completed: ${this.memory.businessCaseProgress.completed.join(', ')}
- Missing: ${this.memory.businessCaseProgress.missing.join(', ')}
- Current Focus: ${this.memory.businessCaseProgress.currentFocus}

PENDING QUESTIONS:
${this.memory.pendingQuestions.map(q => `- ${q}`).join('\n')}

RECENT LEARNINGS:
${importantLearnings.map(l => `- ${l}`).join('\n')}

RECENT CONVERSATION CONTEXT:
${recentConversations.map(c => `${c.speaker}: ${c.message}`).join('\n')}
`;
  }
}


