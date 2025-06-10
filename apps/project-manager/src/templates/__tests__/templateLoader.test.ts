import { describe, it, expect, beforeEach } from 'vitest';
import { 
  substituteVariables, 
  getStandardTemplateConfig,
  type TemplateVariables 
} from '../templateLoader.js';

describe('Template Loader', () => {
  let mockVariables: TemplateVariables;

  beforeEach(() => {
    mockVariables = {
      projectName: 'Test Project',
      organization: 'Test Org',
      description: 'A test project for AI-SDLC',
      date: '2024-01-15'
    };
  });

  describe('substituteVariables', () => {
    it('should replace project name placeholders', () => {
      const template = '# [Project Name]\n\nThis is a project called [Project Name].';
      const result = substituteVariables(template, mockVariables);
      
      expect(result).toBe('# Test Project\n\nThis is a project called Test Project.');
    });

    it('should replace date placeholders', () => {
      const template = 'Created on [Date]';
      const result = substituteVariables(template, mockVariables);
      
      expect(result).toBe('Created on 2024-01-15');
    });

    it('should handle missing variables gracefully', () => {
      const template = '[Project Name] - [Missing Variable]';
      const result = substituteVariables(template, { projectName: 'Test' });
      
      expect(result).toBe('Test - [Missing Variable]');
    });

    it('should add default date if not provided', () => {
      const template = 'Date: [Date]';
      const today = new Date().toISOString().split('T')[0];
      const result = substituteVariables(template, { projectName: 'Test' });
      
      expect(result).toBe(`Date: ${today}`);
    });

    it('should be case insensitive for variable names', () => {
      const template = '[project name] and [PROJECT NAME]';
      const result = substituteVariables(template, mockVariables);
      
      expect(result).toBe('Test Project and Test Project');
    });
  });

  describe('getStandardTemplateConfig', () => {
    it('should return correct number of template files', () => {
      const config = getStandardTemplateConfig(mockVariables);
      
      expect(config).toHaveLength(9);
    });

    it('should include README.md template', () => {
      const config = getStandardTemplateConfig(mockVariables);
      const readmeConfig = config.find(c => c.path === 'README.md');
      
      expect(readmeConfig).toBeDefined();
      expect(readmeConfig?.templatePath).toBe('project-readme.md');
      expect(readmeConfig?.variables).toEqual(mockVariables);
    });

    it('should include docs README template', () => {
      const config = getStandardTemplateConfig(mockVariables);
      const docsReadmeConfig = config.find(c => c.path === 'docs/README.md');
      
      expect(docsReadmeConfig).toBeDefined();
      expect(docsReadmeConfig?.templatePath).toBe('docs-readme.md');
    });

    it('should include all phase1 planning templates', () => {
      const config = getStandardTemplateConfig(mockVariables);
      const phase1Templates = config.filter(c => c.path.includes('phase1-planning'));
      
      expect(phase1Templates).toHaveLength(5);
      
      const expectedTemplates = [
        'business-case-template.md',
        'brd-template.md', 
        'urd-template.md',
        'srs-template.md',
        'add-template.md'
      ];
      
      expectedTemplates.forEach(template => {
        const found = phase1Templates.find(t => t.path.includes(template));
        expect(found).toBeDefined();
      });
    });

    it('should include all phase2 implementation templates', () => {
      const config = getStandardTemplateConfig(mockVariables);
      const phase2Templates = config.filter(c => c.path.includes('phase2-implementation'));
      
      expect(phase2Templates).toHaveLength(2);
      
      const expectedTemplates = [
        'frs-template.md',
        'implementation-plan-template.md'
      ];
      
      expectedTemplates.forEach(template => {
        const found = phase2Templates.find(t => t.path.includes(template));
        expect(found).toBeDefined();
      });
    });

    it('should pass variables to all template configurations', () => {
      const config = getStandardTemplateConfig(mockVariables);
      
      config.forEach(templateConfig => {
        expect(templateConfig.variables).toEqual(mockVariables);
      });
    });
  });

  describe('Template Path Mapping', () => {
    it('should map correct template paths for phase1 planning', () => {
      const config = getStandardTemplateConfig(mockVariables);
      
      const mappings = [
        { path: 'docs/phase1-planning/business-case-template.md', template: 'phase1-planning/business-case.md' },
        { path: 'docs/phase1-planning/brd-template.md', template: 'phase1-planning/brd.md' },
        { path: 'docs/phase1-planning/urd-template.md', template: 'phase1-planning/urd.md' },
        { path: 'docs/phase1-planning/srs-template.md', template: 'phase1-planning/srs.md' },
        { path: 'docs/phase1-planning/add-template.md', template: 'phase1-planning/add.md' }
      ];
      
      mappings.forEach(mapping => {
        const found = config.find(c => c.path === mapping.path);
        expect(found?.templatePath).toBe(mapping.template);
      });
    });

    it('should map correct template paths for phase2 implementation', () => {
      const config = getStandardTemplateConfig(mockVariables);
      
      const mappings = [
        { path: 'docs/phase2-implementation/frs-template.md', template: 'phase2-implementation/frs.md' },
        { path: 'docs/phase2-implementation/implementation-plan-template.md', template: 'phase2-implementation/implementation-plan.md' }
      ];
      
      mappings.forEach(mapping => {
        const found = config.find(c => c.path === mapping.path);
        expect(found?.templatePath).toBe(mapping.template);
      });
    });
  });
});
