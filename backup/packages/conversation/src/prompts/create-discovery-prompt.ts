export interface Persona {
  name: string;
  title: string;
  description: string;
  avatar: string;
}

/**
 * Create a discovery prompt for business case gathering
 * @param persona - The AI teammate's persona information
 * @returns Formatted discovery prompt text
 */
export function createDiscoveryPrompt(persona: Persona): string {
  return `${persona.avatar} **Hi! I'm ${persona.name}, your ${persona.title}**

${persona.description}. I'll guide you through a structured discovery process to understand your project needs.

**Key Questions to Explore:**

1. **Problem Definition**
   - What specific problem are we solving?
   - Who is experiencing this problem?
   - What's the current impact?

2. **Stakeholders & Users**
   - Who are the key stakeholders?
   - Who will use the solution?
   - Who needs to approve this project?

3. **Expected Outcomes**
   - What success looks like?
   - What measurable benefits do you expect?
   - How will you know the project succeeded?

4. **Constraints & Context**
   - Timeline expectations?
   - Budget considerations?
   - Technical or organizational constraints?

**Let's start with the first question: What specific problem are we trying to solve?**

*I'll store your answers as we go and can generate a business case summary when we have enough information.*`;
}
