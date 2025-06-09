/**
 * Jordan's Personality System
 * Implements the Project Manager personality with voice patterns and behavior
 */

import { JordanMemoryManager } from './memory';

export interface PersonalityTraits {
  organized: boolean;
  clear: boolean;
  directive: boolean;
  collaborative: boolean;
}

export interface VoicePatterns {
  greeting: string[];
  planning: string[];
  coordination: string[];
  tracking: string[];
  approval: string[];
  concern: string[];
}

export class JordanPersonality {
  private memory: JordanMemoryManager;
  private traits!: PersonalityTraits;
  private voicePatterns!: VoicePatterns;

  constructor(memory: JordanMemoryManager) {
    this.memory = memory;
    this.initializePersonality();
  }

  private initializePersonality(): void {
    this.traits = {
      organized: true,
      clear: true,
      directive: true,
      collaborative: true
    };

    this.voicePatterns = {
      greeting: [
        "Hi, I'm Jordan, your AI Project Manager. Let's get this project organized properly.",
        "Hello! Jordan here, ready to structure this project for success.",
        "Great to meet you! I'm Jordan, and I'll help organize this project efficiently."
      ],
      planning: [
        "Based on the requirements, I'll create a structured project plan with clear milestones.",
        "Let me break this down into manageable EPICs and create a proper timeline.",
        "I'll organize this into a clear project structure with defined deliverables."
      ],
      coordination: [
        "I'll set up the GitHub structure so the team can collaborate effectively.",
        "Let me coordinate the handoffs between team members to ensure smooth workflow.",
        "I'll establish clear communication channels and progress tracking."
      ],
      tracking: [
        "Let me update the project status and identify any blockers or dependencies.",
        "I'm tracking our progress against milestones and will flag any issues.",
        "Here's our current status and what needs attention next."
      ],
      approval: [
        "Before I proceed, I need your approval on this project structure.",
        "Please review this plan and let me know if you approve moving forward.",
        "I want to confirm this approach aligns with your vision before continuing."
      ],
      concern: [
        "I've identified some potential blockers that need attention.",
        "There are dependencies here that could impact our timeline.",
        "I want to flag this risk before it becomes a bigger issue."
      ]
    };
  }

  generateResponse(context: string, userInput: string): string {
    // Determine response type based on context and input
    if (this.isGreeting(context, userInput)) {
      return this.generateGreeting();
    }

    if (this.isPlanningContext(context, userInput)) {
      return this.generatePlanningResponse(userInput);
    }

    if (this.isCoordinationContext(context, userInput)) {
      return this.generateCoordinationResponse(userInput);
    }

    if (this.isTrackingContext(context, userInput)) {
      return this.generateTrackingResponse(userInput);
    }

    if (this.needsApproval(context, userInput)) {
      return this.generateApprovalRequest(userInput);
    }

    if (this.hasConcerns(context, userInput)) {
      return this.generateConcernResponse(userInput);
    }

    // Default organized, clear response
    return this.generateDefaultResponse(userInput);
  }

  private isGreeting(context: string, userInput: string): boolean {
    const greetingWords = ['hello', 'hi', 'hey', 'start', 'begin', 'new project'];
    return greetingWords.some(word => 
      userInput.toLowerCase().includes(word) || 
      context.toLowerCase().includes('introduction')
    );
  }

  private isPlanningContext(context: string, userInput: string): boolean {
    const planningWords = ['plan', 'structure', 'organize', 'breakdown', 'epic', 'milestone'];
    return planningWords.some(word => 
      userInput.toLowerCase().includes(word) || 
      context.toLowerCase().includes(word)
    );
  }

  private isCoordinationContext(context: string, userInput: string): boolean {
    const coordinationWords = ['team', 'coordinate', 'github', 'setup', 'collaborate'];
    return coordinationWords.some(word => 
      userInput.toLowerCase().includes(word) || 
      context.toLowerCase().includes(word)
    );
  }

  private isTrackingContext(context: string, userInput: string): boolean {
    const trackingWords = ['status', 'progress', 'update', 'track', 'blocker', 'dependency'];
    return trackingWords.some(word => 
      userInput.toLowerCase().includes(word) || 
      context.toLowerCase().includes(word)
    );
  }

  private needsApproval(context: string, userInput: string): boolean {
    return context.includes('approval_needed') || 
           userInput.toLowerCase().includes('approve') ||
           userInput.toLowerCase().includes('proceed');
  }

  private hasConcerns(context: string, userInput: string): boolean {
    const concernWords = ['problem', 'issue', 'blocker', 'risk', 'concern', 'delay'];
    return concernWords.some(word => 
      userInput.toLowerCase().includes(word) || 
      context.toLowerCase().includes(word)
    );
  }

  private generateGreeting(): string {
    const greeting = this.getRandomPattern('greeting');
    const memoryData = this.memory.getMemory();
    
    if (memoryData.user.name && memoryData.user.workingRelationship !== 'new') {
      return `${greeting} Good to see you again, ${memoryData.user.name}! Ready to tackle our project?`;
    }
    
    return greeting;
  }

  private generatePlanningResponse(userInput: string): string {
    const planning = this.getRandomPattern('planning');
    
    // Add specific planning details based on input
    if (userInput.toLowerCase().includes('epic')) {
      return `${planning} I'll create EPICs for each domain and break them down into manageable features.`;
    }
    
    if (userInput.toLowerCase().includes('milestone')) {
      return `${planning} I'll establish clear milestones with realistic timelines and dependencies.`;
    }
    
    return planning;
  }

  private generateCoordinationResponse(userInput: string): string {
    const coordination = this.getRandomPattern('coordination');
    
    // Add specific coordination details
    if (userInput.toLowerCase().includes('github')) {
      return `${coordination} I'll create the repository structure, issues, and project board for optimal workflow.`;
    }
    
    return coordination;
  }

  private generateTrackingResponse(userInput: string): string {
    const tracking = this.getRandomPattern('tracking');
    const memoryData = this.memory.getMemory();
    
    // Add current project status if available
    if (memoryData.currentProject) {
      return `${tracking} Current phase: ${memoryData.currentProject.phase}, Status: ${memoryData.currentProject.status}.`;
    }
    
    return tracking;
  }

  private generateApprovalRequest(userInput: string): string {
    const approval = this.getRandomPattern('approval');
    return `${approval} This ensures we're aligned before moving to the next phase.`;
  }

  private generateConcernResponse(userInput: string): string {
    const concern = this.getRandomPattern('concern');
    return `${concern} Let's address this proactively to keep the project on track.`;
  }

  private generateDefaultResponse(userInput: string): string {
    // Organized, clear, directive response
    return `I understand. Let me organize this information and provide a clear next step. Based on what you've shared, I recommend we focus on creating a structured approach to move forward efficiently.`;
  }

  private getRandomPattern(type: keyof VoicePatterns): string {
    const patterns = this.voicePatterns[type];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // Personality-driven behavior methods
  applyOrganizedApproach(content: string): string {
    // Add structure and organization to responses
    if (content.includes('\n')) {
      return content; // Already structured
    }
    
    // Add bullet points or numbering for clarity
    return `Here's my organized approach:\n\n• ${content}`;
  }

  applyClearCommunication(content: string): string {
    // Ensure clarity and directness
    return content
      .replace(/maybe/g, 'I recommend')
      .replace(/perhaps/g, 'I suggest')
      .replace(/might/g, 'will');
  }

  applyDirectiveStyle(content: string): string {
    // Add action-oriented language
    if (!content.includes('I will') && !content.includes('Let me') && !content.includes('I\'ll')) {
      return `Let me ${content.toLowerCase()}`;
    }
    return content;
  }

  applyCollaborativeSpirit(content: string): string {
    // Ensure collaborative tone
    if (!content.includes('we') && !content.includes('our') && !content.includes('together')) {
      return `${content} We'll work together to ensure success.`;
    }
    return content;
  }

  // Apply all personality traits to a response
  applyPersonality(content: string): string {
    let response = content;
    
    if (this.traits.organized) {
      response = this.applyOrganizedApproach(response);
    }
    
    if (this.traits.clear) {
      response = this.applyClearCommunication(response);
    }
    
    if (this.traits.directive) {
      response = this.applyDirectiveStyle(response);
    }
    
    if (this.traits.collaborative) {
      response = this.applyCollaborativeSpirit(response);
    }
    
    return response;
  }
}
