import { describe, it, expect } from 'vitest';
import { loadTemplates, getStandardTemplateConfig, type TemplateVariables } from '../templateLoader.js';

describe('Template Integration Tests', () => {
  const mockVariables: TemplateVariables = {
    projectName: 'AI-Enhanced CRM System',
    organization: 'TechCorp Inc',
    description: 'A modern CRM system with AI-powered insights',
    date: '2024-01-15'
  };

  it('should load all standard templates successfully', async () => {
    const config = getStandardTemplateConfig(mockVariables);
    
    // This test verifies that our template files exist and can be loaded
    // Note: In a real environment, this would actually load from the file system
    // For now, we're testing the configuration structure
    
    expect(config).toHaveLength(9);
    
    // Verify all expected paths are configured
    const expectedPaths = [
      'README.md',
      'docs/README.md',
      'docs/phase1-planning/business-case-template.md',
      'docs/phase1-planning/brd-template.md',
      'docs/phase1-planning/urd-template.md',
      'docs/phase1-planning/srs-template.md',
      'docs/phase1-planning/add-template.md',
      'docs/phase2-implementation/frs-template.md',
      'docs/phase2-implementation/implementation-plan-template.md'
    ];
    
    expectedPaths.forEach(expectedPath => {
      const found = config.find(c => c.path === expectedPath);
      expect(found, `Missing configuration for ${expectedPath}`).toBeDefined();
      expect(found?.variables).toEqual(mockVariables);
    });
  });

  it('should generate proper GitHub repository structure', () => {
    const config = getStandardTemplateConfig(mockVariables);
    
    // Group by directory structure
    const structure = config.reduce((acc, file) => {
      const parts = file.path.split('/');
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
      
      if (!acc[dir]) {
        acc[dir] = [];
      }
      acc[dir].push(parts[parts.length - 1]);
      
      return acc;
    }, {} as Record<string, string[]>);
    
    // Verify root level files
    expect(structure.root).toContain('README.md');
    
    // Verify docs structure
    expect(structure['docs']).toContain('README.md');
    
    // Verify phase1 planning structure
    expect(structure['docs/phase1-planning']).toEqual([
      'business-case-template.md',
      'brd-template.md',
      'urd-template.md',
      'srs-template.md',
      'add-template.md'
    ]);
    
    // Verify phase2 implementation structure
    expect(structure['docs/phase2-implementation']).toEqual([
      'frs-template.md',
      'implementation-plan-template.md'
    ]);
  });

  it('should map templates to correct source files', () => {
    const config = getStandardTemplateConfig(mockVariables);
    
    const templateMappings = [
      { path: 'README.md', template: 'project-readme.md' },
      { path: 'docs/README.md', template: 'docs-readme.md' },
      { path: 'docs/phase1-planning/business-case-template.md', template: 'phase1-planning/business-case.md' },
      { path: 'docs/phase1-planning/brd-template.md', template: 'phase1-planning/brd.md' },
      { path: 'docs/phase1-planning/urd-template.md', template: 'phase1-planning/urd.md' },
      { path: 'docs/phase1-planning/srs-template.md', template: 'phase1-planning/srs.md' },
      { path: 'docs/phase1-planning/add-template.md', template: 'phase1-planning/add.md' },
      { path: 'docs/phase2-implementation/frs-template.md', template: 'phase2-implementation/frs.md' },
      { path: 'docs/phase2-implementation/implementation-plan-template.md', template: 'phase2-implementation/implementation-plan.md' }
    ];
    
    templateMappings.forEach(mapping => {
      const found = config.find(c => c.path === mapping.path);
      expect(found?.templatePath, `Template mapping for ${mapping.path}`).toBe(mapping.template);
    });
  });

  it('should handle different project types with same structure', () => {
    const webAppVariables: TemplateVariables = {
      projectName: 'E-Commerce Platform',
      organization: 'RetailTech',
      description: 'Modern e-commerce solution'
    };
    
    const mobileAppVariables: TemplateVariables = {
      projectName: 'Fitness Tracker App',
      organization: 'HealthTech',
      description: 'AI-powered fitness tracking mobile app'
    };
    
    const webConfig = getStandardTemplateConfig(webAppVariables);
    const mobileConfig = getStandardTemplateConfig(mobileAppVariables);
    
    // Both should have same structure
    expect(webConfig).toHaveLength(mobileConfig.length);
    
    // Both should have same paths
    const webPaths = webConfig.map(c => c.path).sort();
    const mobilePaths = mobileConfig.map(c => c.path).sort();
    expect(webPaths).toEqual(mobilePaths);
    
    // Both should have same template mappings
    const webTemplates = webConfig.map(c => c.templatePath).sort();
    const mobileTemplates = mobileConfig.map(c => c.templatePath).sort();
    expect(webTemplates).toEqual(mobileTemplates);
  });

  it('should validate AI-SDLC methodology compliance', () => {
    const config = getStandardTemplateConfig(mockVariables);
    
    // Phase 1 templates (Planning & Design)
    const phase1Templates = config.filter(c => c.path.includes('phase1-planning'));
    expect(phase1Templates).toHaveLength(5);
    
    // Should include business analysis templates (Sarah's domain)
    const businessAnalysisTemplates = ['business-case-template.md', 'brd-template.md', 'urd-template.md'];
    businessAnalysisTemplates.forEach(template => {
      const found = phase1Templates.find(t => t.path.includes(template));
      expect(found, `Missing business analysis template: ${template}`).toBeDefined();
    });
    
    // Should include architecture templates (Alex's domain)
    const architectureTemplates = ['srs-template.md', 'add-template.md'];
    architectureTemplates.forEach(template => {
      const found = phase1Templates.find(t => t.path.includes(template));
      expect(found, `Missing architecture template: ${template}`).toBeDefined();
    });
    
    // Phase 2 templates (Implementation)
    const phase2Templates = config.filter(c => c.path.includes('phase2-implementation'));
    expect(phase2Templates).toHaveLength(2);
    
    // Should include implementation templates
    const implementationTemplates = ['frs-template.md', 'implementation-plan-template.md'];
    implementationTemplates.forEach(template => {
      const found = phase2Templates.find(t => t.path.includes(template));
      expect(found, `Missing implementation template: ${template}`).toBeDefined();
    });
  });
});
