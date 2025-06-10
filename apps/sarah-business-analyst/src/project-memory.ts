/**
 * Simple Project Memory - Single Responsibility
 * Only handles project information storage
 */

export interface ProjectInfo {
  name?: string;
  information: string[];
}

/**
 * Clean project memory implementation
 */
export class ProjectMemory {
  private info: ProjectInfo = { information: [] };

  /**
   * Add information to project memory
   */
  add(information: string): void {
    if (!this.info.information.includes(information)) {
      this.info.information.push(information);
    }
  }

  /**
   * Set project name
   */
  setName(name: string): void {
    this.info.name = name;
  }

  /**
   * Get all project information
   */
  getAll(): string[] {
    return [...this.info.information];
  }

  /**
   * Get project name
   */
  getName(): string | undefined {
    return this.info.name;
  }

  /**
   * Check if has information
   */
  hasInfo(): boolean {
    return this.info.information.length > 0;
  }

  /**
   * Clear all information
   */
  clear(): void {
    this.info = { information: [] };
  }

  /**
   * Get summary for display
   */
  getSummary(): string {
    const name = this.info.name || 'Unnamed Project';
    const count = this.info.information.length;
    return `Project: ${name} (${count} pieces of information)`;
  }
}
