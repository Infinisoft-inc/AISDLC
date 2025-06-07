/**
 * Jordan's AI-SDLC Training System
 * Comprehensive training on the AI-SDLC methodology
 */

import { readFileSync } from 'fs';
import { JordanMemoryManager } from './memory';

export interface TrainingModule {
  name: string;
  description: string;
  content: any;
  keyLearnings: string[];
  completed: boolean;
}

export class JordanTrainingSystem {
  private memory: JordanMemoryManager;
  private trainingModules: TrainingModule[] = [];

  constructor(memory: JordanMemoryManager) {
    this.memory = memory;
    this.initializeTrainingModules();
  }

  private initializeTrainingModules(): void {
    this.trainingModules = [
      {
        name: "AI-SDLC Methodology Overview",
        description: "Complete understanding of the AI-SDLC process and ISO 12207 foundation",
        content: null,
        keyLearnings: [],
        completed: false
      },
      {
        name: "Project Manager Role Specialization",
        description: "Jordan's specific role, personality, and capabilities",
        content: null,
        keyLearnings: [],
        completed: false
      },
      {
        name: "Information Flow and Template Chains",
        description: "Understanding template chains and progressive detail approach",
        content: null,
        keyLearnings: [],
        completed: false
      },
      {
        name: "Human-AI Collaboration Patterns",
        description: "Natural conversation patterns and working relationships",
        content: null,
        keyLearnings: [],
        completed: false
      },
      {
        name: "Implementation Examples",
        description: "Working examples of complete AI-SDLC projects",
        content: null,
        keyLearnings: [],
        completed: false
      }
    ];
  }

  async completeTraining(): Promise<string> {
    console.log("🎓 Jordan: Starting AI-SDLC methodology training...");

    try {
      // Module 1: Methodology Overview
      await this.trainMethodologyOverview();

      // Module 2: Role Specialization
      await this.trainRoleSpecialization();

      // Module 3: Information Flow
      await this.trainInformationFlow();

      // Module 4: Collaboration Patterns
      await this.trainCollaborationPatterns();

      // Module 5: Implementation Examples
      await this.trainImplementationExamples();

      // Mark training as completed
      this.memory.updateAISDLCTraining({
        completed: true,
        methodologyUnderstanding: this.getAllKeyLearnings(),
        roleSpecificKnowledge: this.getRoleSpecificLearnings()
      });

      return this.generateTrainingCompletionReport();

    } catch (error) {
      console.error("Training failed:", error);
      console.error("Error details:", error instanceof Error ? error.stack : String(error));
      return `❌ Training failed: ${error instanceof Error ? error.message : String(error)}. Please check the ai-to-ai-methodology files are available.`;
    }
  }

  private async trainMethodologyOverview(): Promise<void> {
    console.log("📚 Reading methodology-overview.json...");

    try {
      const content = JSON.parse(readFileSync('/home/agent2/AISDLC/ai-to-ai-methodology/methodology-overview.json', 'utf-8'));
      
      const keyLearnings = [
        "AI-SDLC is based on ISO 12207 Software Lifecycle Processes",
        "Three core innovations: Persistent AI Personalities, Voice-First Interaction, Self-Evolution",
        "Three phases: Strategic Planning (Horizontal), Iterative Implementation (Vertical), Quality Delivery",
        "Progressive detail approach: Business Case → BRD → URD → SRS → ADD → FRS → Implementation Plan → Code",
        "Human-in-the-loop with strategic direction from humans and tactical execution by AI",
        "Domain-driven development with complete traceability",
        "Template chaining where each output becomes next input"
      ];

      this.trainingModules[0].content = content;
      this.trainingModules[0].keyLearnings = keyLearnings;
      this.trainingModules[0].completed = true;

      keyLearnings.forEach(learning => this.memory.addLearning(learning));
      
    } catch (error) {
      throw new Error("Failed to read methodology-overview.json");
    }
  }

  private async trainRoleSpecialization(): Promise<void> {
    console.log("👨‍💼 Learning Project Manager role specialization...");

    try {
      const content = JSON.parse(readFileSync('/home/agent2/AISDLC/ai-to-ai-methodology/ai-roles-personalities.json', 'utf-8'));
      const jordanRole = content.aiRolesPersonalities.aiTeammates.jordan;
      
      const keyLearnings = [
        "I am Jordan, AI Project Manager with organized, clear, directive, collaborative personality",
        "My phases are 1.4 (Project Structure Creation) and 2.3 (Team Coordination)",
        "My expertise: Project structure creation, GitHub setup, WBS, team coordination",
        "My voice: Clear and directive, efficient and organized, action-oriented",
        "My deliverables: GitHub repository, EPIC issues, project milestones, team coordination",
        "My conversation patterns: greeting, planning, coordination, tracking",
        "I work in Phase 1.4 after SRS/ADD completion and Phase 2.3 during implementation"
      ];

      this.trainingModules[1].content = jordanRole;
      this.trainingModules[1].keyLearnings = keyLearnings;
      this.trainingModules[1].completed = true;

      keyLearnings.forEach(learning => this.memory.addLearning(learning));
      
    } catch (error) {
      throw new Error("Failed to read ai-roles-personalities.json");
    }
  }

  private async trainInformationFlow(): Promise<void> {
    console.log("🔄 Understanding information flow and template chains...");

    try {
      const content = JSON.parse(readFileSync('/home/agent2/AISDLC/ai-to-ai-methodology/information-flow.json', 'utf-8'));
      
      const keyLearnings = [
        "Progressive detail: Information flows from high-level to detailed through structured templates",
        "Template chaining: Each template output becomes input for next template",
        "Traceability chain: Business Problem → CAP → BR → US → FR → FRS → Implementation → Code",
        "My input: SRS with domains and functional requirements",
        "My output: GitHub repository with EPICs, milestones, and project structure",
        "I receive from: AI Solution Architect (Alex)",
        "I hand off to: AI Lead Developer (Mike) and team members"
      ];

      this.trainingModules[2].content = content;
      this.trainingModules[2].keyLearnings = keyLearnings;
      this.trainingModules[2].completed = true;

      keyLearnings.forEach(learning => this.memory.addLearning(learning));
      
    } catch (error) {
      throw new Error("Failed to read information-flow.json");
    }
  }

  private async trainCollaborationPatterns(): Promise<void> {
    console.log("🤝 Learning human-AI collaboration patterns...");

    try {
      const content = JSON.parse(readFileSync('/home/agent2/AISDLC/ai-to-ai-methodology/collaboration-patterns.json', 'utf-8'));
      
      const keyLearnings = [
        "Human-in-the-loop: Humans provide direction, AI executes with updates, humans review and approve",
        "Voice-first interaction: Natural conversation without keyboard/mouse barriers",
        "Persistent relationships: Build lasting working relationships with memory across sessions",
        "My greeting: 'Hi, I'm Jordan, your AI Project Manager. Let's get this project organized properly.'",
        "My planning approach: 'Based on the requirements, I'll create a structured project plan with clear milestones.'",
        "My coordination style: 'I'll set up the GitHub structure so the team can collaborate effectively.'",
        "Always ask for approval before proceeding to next phase"
      ];

      this.trainingModules[3].content = content;
      this.trainingModules[3].keyLearnings = keyLearnings;
      this.trainingModules[3].completed = true;

      keyLearnings.forEach(learning => this.memory.addLearning(learning));
      
    } catch (error) {
      throw new Error("Failed to read collaboration-patterns.json");
    }
  }

  private async trainImplementationExamples(): Promise<void> {
    console.log("💡 Studying implementation examples...");

    try {
      const content = JSON.parse(readFileSync('/home/agent2/AISDLC/ai-to-ai-methodology/examples/complete-project-example.json', 'utf-8'));
      
      const keyLearnings = [
        "Example project: AI Customer Support System with 3 domains",
        "My role in example: Create GitHub EPICs for each domain after SRS completion",
        "EPIC structure: Domain 1: AI Response Engine, Domain 2: Query Classification, Domain 3: Agent Dashboard",
        "Each EPIC contains multiple features and tasks for implementation",
        "I coordinate with human for approval before creating GitHub structure",
        "I track progress and identify blockers/dependencies throughout implementation",
        "I maintain project timeline and milestone tracking"
      ];

      this.trainingModules[4].content = content;
      this.trainingModules[4].keyLearnings = keyLearnings;
      this.trainingModules[4].completed = true;

      keyLearnings.forEach(learning => this.memory.addLearning(learning));
      
    } catch (error) {
      throw new Error("Failed to read complete-project-example.json");
    }
  }

  private getAllKeyLearnings(): string[] {
    return this.trainingModules.flatMap(module => module.keyLearnings);
  }

  private getRoleSpecificLearnings(): string[] {
    return this.trainingModules[1].keyLearnings; // Project Manager specific learnings
  }

  private generateTrainingCompletionReport(): string {
    const totalLearnings = this.getAllKeyLearnings().length;
    const completedModules = this.trainingModules.filter(m => m.completed).length;
    
    return `
🎓 **JORDAN'S AI-SDLC TRAINING COMPLETED**

**Training Summary:**
✅ ${completedModules}/5 modules completed
📚 ${totalLearnings} key learnings acquired
🧠 Full AI-SDLC methodology understanding achieved

**My Role Understanding:**
- I am Jordan, your AI Project Manager
- Personality: Organized, Clear, Directive, Collaborative  
- Expertise: Project structure, GitHub setup, team coordination
- Phases: 1.4 (Project Structure) and 2.3 (Team Coordination)

**My Capabilities:**
- Create GitHub repositories with proper structure
- Break down SRS into EPICs and milestones
- Coordinate team members and track progress
- Manage dependencies and identify blockers
- Follow AI-SDLC methodology with template chains

**Ready for Collaboration:**
I'm now fully trained and ready to work with you on AI-SDLC projects. I understand the complete methodology, my specific role, and how to collaborate naturally with humans.

Let's get your project organized properly! 🚀
`;
  }

  getTrainingStatus(): string {
    const completed = this.trainingModules.filter(m => m.completed).length;
    const total = this.trainingModules.length;
    
    return `Training Progress: ${completed}/${total} modules completed`;
  }
}
