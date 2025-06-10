import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Template Loader Service
 * Single Responsibility: Load and process template files with variable substitution
 */

export interface TemplateVariables {
  projectName: string;
  organization?: string;
  description?: string;
  date?: string;
  author?: string;
  authorEmail?: string;
  [key: string]: string | undefined;
}

export interface TemplateFile {
  path: string;
  templatePath: string;
  variables?: TemplateVariables;
}

/**
 * Load a template file and substitute variables
 */
export async function loadTemplate(
  templatePath: string,
  variables: TemplateVariables = {} as TemplateVariables
): Promise<string> {
  try {
    // Get the root directory - go up from apps/project-manager to workspace root
    const currentDir = process.cwd();
    const rootDir = currentDir.includes('apps/project-manager')
      ? join(currentDir, '../../')
      : currentDir;
    const fullTemplatePath = join(rootDir, 'templates', templatePath);

    console.log(`📄 Loading template: ${templatePath} from ${fullTemplatePath}`);

    const templateContent = await readFile(fullTemplatePath, 'utf-8');

    // Substitute variables
    return substituteVariables(templateContent, variables);
  } catch (error) {
    console.error(`❌ Failed to load template ${templatePath}:`, error);
    throw new Error(`Template loading failed: ${templatePath}`);
  }
}

/**
 * Substitute variables in template content
 */
export function substituteVariables(content: string, variables: TemplateVariables): string {
  let result = content;
  
  // Add default variables
  const defaultVariables: TemplateVariables = {
    date: new Date().toISOString().split('T')[0],
    organization: 'Infinisoft-inc',
    author: 'Martin Ouimet',
    authorEmail: 'mouimet@infinisoft.world',
    ...variables
  };
  
  // Replace [Variable Name] patterns (case insensitive)
  for (const [key, value] of Object.entries(defaultVariables)) {
    if (value !== undefined) {
      // Handle both exact key match and "project name" style
      const patterns = [
        new RegExp(`\\[${key}\\]`, 'gi'),
        new RegExp(`\\[${key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}\\]`, 'gi'),
        new RegExp(`\\[${key.replace(/([A-Z])/g, ' $1').toUpperCase().trim()}\\]`, 'gi')
      ];

      patterns.forEach(pattern => {
        result = result.replace(pattern, value);
      });
    }
  }
  
  // Replace specific patterns
  result = result.replace(/\[Project Name\]/g, variables.projectName || '[Project Name]');
  result = result.replace(/\[Date\]/g, defaultVariables.date || '[Date]');
  
  return result;
}

/**
 * Load multiple templates with the same variables
 */
export async function loadTemplates(
  templateFiles: TemplateFile[]
): Promise<Array<{ path: string; content: string }>> {
  const results = [];
  
  for (const templateFile of templateFiles) {
    try {
      const content = await loadTemplate(
        templateFile.templatePath, 
        templateFile.variables || {} as TemplateVariables
      );
      
      results.push({
        path: templateFile.path,
        content
      });
    } catch (error) {
      console.error(`❌ Failed to load template file ${templateFile.templatePath}:`, error);
      // Continue with other templates
    }
  }
  
  return results;
}

/**
 * Get standard AI-SDLC template configuration
 */
export function getStandardTemplateConfig(variables: TemplateVariables): TemplateFile[] {
  return [
    {
      path: 'README.md',
      templatePath: 'project-readme.md',
      variables
    },
    {
      path: 'docs/README.md',
      templatePath: 'docs-readme.md',
      variables
    },
    {
      path: 'docs/phase1-planning/business-case-template.md',
      templatePath: 'phase1-planning/business-case.md',
      variables
    },
    {
      path: 'docs/phase1-planning/brd-template.md',
      templatePath: 'phase1-planning/brd.md',
      variables
    },
    {
      path: 'docs/phase1-planning/urd-template.md',
      templatePath: 'phase1-planning/urd.md',
      variables
    },
    {
      path: 'docs/phase1-planning/srs-template.md',
      templatePath: 'phase1-planning/srs.md',
      variables
    },
    {
      path: 'docs/phase1-planning/add-template.md',
      templatePath: 'phase1-planning/add.md',
      variables
    },
    {
      path: 'docs/phase2-implementation/frs-template.md',
      templatePath: 'phase2-implementation/frs.md',
      variables
    },
    {
      path: 'docs/phase2-implementation/implementation-plan-template.md',
      templatePath: 'phase2-implementation/implementation-plan.md',
      variables
    }
  ];
}
