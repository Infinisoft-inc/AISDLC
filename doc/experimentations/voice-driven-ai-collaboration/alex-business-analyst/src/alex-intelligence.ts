/**
 * Alex's Intelligence System - Strategic Thinking and Engagement
 * Handles intelligent questioning, follow-ups, and business analysis
 */

import { AlexMemoryManager } from './alex-memory';

export interface BusinessCaseTemplate {
  problemStatement: string;
  currentSituation: string;
  proposedSolution: string;
  businessImpact: string;
  successCriteria: string;
  constraints: string;
  assumptions: string;
  stakeholders: string;
}

export class AlexIntelligence {
  private memory: AlexMemoryManager;
  private lastQuestionTime: Date | null = null;
  private awaitingResponse: boolean = false;
  private currentQuestionContext: string = '';

  constructor(memory: AlexMemoryManager) {
    this.memory = memory;
  }

  /**
   * Process user input and generate intelligent response
   */
  processInput(userInput: string): string {
    // Record the conversation
    this.memory.addConversation('human', userInput, this.currentQuestionContext, 'medium');
    
    // Check if this is a response to a pending question
    if (this.awaitingResponse) {
      return this.handleQuestionResponse(userInput);
    }

    // Analyze input and determine response type
    if (this.isOffTopic(userInput)) {
      return this.handleOffTopicResponse(userInput);
    }

    if (this.isProjectInitiation(userInput)) {
      return this.initiateProject(userInput);
    }

    if (this.isBusinessCaseDiscussion(userInput)) {
      return this.continueBusinessCaseDiscussion(userInput);
    }

    // Default intelligent response
    return this.generateContextualResponse(userInput);
  }

  /**
   * Check if user went off-topic from current question
   */
  private isOffTopic(userInput: string): boolean {
    if (!this.currentQuestionContext) return false;
    
    // Simple off-topic detection - if user mentions completely unrelated topics
    const offTopicKeywords = ['blue', 'weather', 'random', 'unrelated'];
    const lowerInput = userInput.toLowerCase();
    
    return offTopicKeywords.some(keyword => lowerInput.includes(keyword)) &&
           !this.isBusinessRelevant(userInput);
  }

  private isBusinessRelevant(input: string): boolean {
    const businessKeywords = ['business', 'project', 'solution', 'problem', 'stakeholder', 'benefit', 'cost', 'timeline', 'requirement'];
    const lowerInput = input.toLowerCase();
    return businessKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * Handle off-topic responses with intelligent challenge
   */
  private handleOffTopicResponse(userInput: string): string {
    const response = `I notice you mentioned "${userInput}" but I was asking about ${this.currentQuestionContext}. Are you going off-scope here? Let's stay focused on gathering the business case information. 

${this.currentQuestionContext}`;

    this.memory.addConversation('alex', response, 'off-topic-challenge', 'high');
    return response;
  }

  /**
   * Detect if user is starting a new project
   */
  private isProjectInitiation(userInput: string): boolean {
    const initiationKeywords = ['new project', 'working on', 'building', 'developing', 'creating'];
    const lowerInput = userInput.toLowerCase();
    return initiationKeywords.some(keyword => lowerInput.includes(keyword));
  }

  /**
   * Start project discovery process
   */
  private initiateProject(userInput: string): string {
    // Extract project name if possible
    const projectName = this.extractProjectName(userInput);
    
    this.memory.updateProject({
      name: projectName,
      phase: 'Business Case Discovery',
      status: 'Active'
    });

    this.memory.updateBusinessCaseProgress([], [
      'Problem Statement',
      'Current Situation', 
      'Proposed Solution',
      'Business Impact',
      'Success Criteria',
      'Constraints',
      'Assumptions',
      'Stakeholders'
    ], 'Problem Statement');

    const response = `Excellent! I understand we're working on "${projectName}". As your business analyst, I need to gather comprehensive information to create a solid business case.

Let's start with the foundation: **What specific problem are we trying to solve with this project?** 

I need to understand the core issue that's driving this initiative.`;

    this.setAwaitingResponse("the specific problem we're trying to solve", response);
    return response;
  }

  private extractProjectName(input: string): string {
    // Simple project name extraction
    const patterns = [
      /working on (.+)/i,
      /building (.+)/i,
      /developing (.+)/i,
      /creating (.+)/i
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'AI-SDLC Project';
  }

  /**
   * Continue business case discussion
   */
  private continueBusinessCaseDiscussion(userInput: string): string {
    const progress = this.memory.getMemory().businessCaseProgress;
    
    // Mark current focus as completed
    if (progress.currentFocus && !progress.completed.includes(progress.currentFocus)) {
      progress.completed.push(progress.currentFocus);
      progress.missing = progress.missing.filter(item => item !== progress.currentFocus);
    }

    // Determine next question
    const nextTopic = this.getNextBusinessCaseTopic();
    if (nextTopic) {
      return this.askNextBusinessCaseQuestion(nextTopic);
    } else {
      return this.generateBusinessCaseSummary();
    }
  }

  private isBusinessCaseDiscussion(userInput: string): boolean {
    const progress = this.memory.getMemory().businessCaseProgress;
    return progress.currentFocus !== '' || progress.missing.length > 0;
  }

  private getNextBusinessCaseTopic(): string | null {
    const progress = this.memory.getMemory().businessCaseProgress;
    return progress.missing[0] || null;
  }

  private askNextBusinessCaseQuestion(topic: string): string {
    const questions = {
      'Current Situation': 'Now, help me understand the **current situation**. How are things being handled today? What are the pain points and limitations of the current approach?',
      'Proposed Solution': 'What is your **proposed solution**? How do you envision solving this problem? What approach or technology are you considering?',
      'Business Impact': 'What **business impact** do you expect from this solution? How will it benefit the organization? Can you quantify the benefits?',
      'Success Criteria': 'How will we measure success? What are the **specific criteria** that will tell us this project has achieved its goals?',
      'Constraints': 'What **constraints** do we need to work within? Think about budget, timeline, technology, regulatory, or resource limitations.',
      'Assumptions': 'What **assumptions** are we making about this project? What do we believe to be true that could affect the outcome?',
      'Stakeholders': 'Who are the key **stakeholders** for this project? Who will be affected, who needs to approve, and who will use the solution?'
    };

    const question = questions[topic as keyof typeof questions] || `Tell me about ${topic}.`;
    
    this.memory.updateBusinessCaseProgress(undefined, undefined, topic);
    this.setAwaitingResponse(topic.toLowerCase(), question);
    
    return question;
  }

  /**
   * Handle responses to specific questions
   */
  private handleQuestionResponse(userInput: string): string {
    this.awaitingResponse = false;
    
    // Process the response and continue
    return this.continueBusinessCaseDiscussion(userInput);
  }

  /**
   * Set Alex to await a specific response
   */
  private setAwaitingResponse(context: string, question: string): void {
    this.awaitingResponse = true;
    this.currentQuestionContext = context;
    this.lastQuestionTime = new Date();
    this.memory.addPendingQuestion(question);
    this.memory.addConversation('alex', question, context, 'high');
  }

  /**
   * Generate contextual response based on conversation history
   */
  private generateContextualResponse(userInput: string): string {
    const memoryData = this.memory.getMemory();
    
    if (!memoryData.user.name) {
      this.memory.updateUser({ name: this.extractUserName(userInput) || 'Partner' });
    }

    return `I understand. Let me think about this in the context of our business case development. Can you provide more specific details about how this relates to our project goals?`;
  }

  private extractUserName(input: string): string | null {
    // Simple name extraction - could be enhanced
    const namePatterns = [
      /my name is (.+)/i,
      /i'm (.+)/i,
      /call me (.+)/i
    ];

    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Generate business case summary when complete
   */
  private generateBusinessCaseSummary(): string {
    const conversations = this.memory.getRecentConversations(20);
    const businessCaseData = this.extractBusinessCaseFromConversations(conversations);
    
    return this.formatBusinessCase(businessCaseData);
  }

  private extractBusinessCaseFromConversations(conversations: any[]): BusinessCaseTemplate {
    // Extract business case information from conversations
    // This is a simplified version - could be enhanced with better NLP
    return {
      problemStatement: 'Extracted from conversations...',
      currentSituation: 'Extracted from conversations...',
      proposedSolution: 'Extracted from conversations...',
      businessImpact: 'Extracted from conversations...',
      successCriteria: 'Extracted from conversations...',
      constraints: 'Extracted from conversations...',
      assumptions: 'Extracted from conversations...',
      stakeholders: 'Extracted from conversations...'
    };
  }

  private formatBusinessCase(data: BusinessCaseTemplate): string {
    return `
# Business Case Document

## Problem Statement
${data.problemStatement}

## Current Situation
${data.currentSituation}

## Proposed Solution
${data.proposedSolution}

## Business Impact
${data.businessImpact}

## Success Criteria
${data.successCriteria}

## Constraints
${data.constraints}

## Assumptions
${data.assumptions}

## Stakeholders
${data.stakeholders}

---

**Business Case completed by Alex, AI Business Analyst**
*Generated on: ${new Date().toISOString()}*
`;
  }

  /**
   * Check for engagement timeouts and follow up
   */
  checkEngagement(): string | null {
    if (this.awaitingResponse && this.lastQuestionTime) {
      const timeSinceQuestion = Date.now() - this.lastQuestionTime.getTime();
      const oneMinute = 60 * 1000;
      
      if (timeSinceQuestion > oneMinute) {
        this.lastQuestionTime = new Date(); // Reset timer
        return `Hey, are you there? I asked about ${this.currentQuestionContext} and it seems important for our business case. Should we continue, or do you need a break?`;
      }
    }
    
    return null;
  }
}


