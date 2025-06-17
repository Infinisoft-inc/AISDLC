import { Octokit } from '@octokit/rest';
import { createGitHubSetup } from '@brainstack/integration-service';
import { JordanMemoryManager } from '../memory.js';
import {
  loadTemplates,
  getStandardTemplateConfig,
  type TemplateVariables
} from '../templates/templateLoader.js';

export interface DocumentStructureData {
  owner: string;
  repo: string;
  projectName: string;
  organization?: string;
}

export interface DocumentStructureResult {
  success: boolean;
  data?: {
    filesCreated: string[];
    summary: string;
  };
  error?: string;
}

/**
 * Create complete AI-SDLC document structure with templates and README
 */
export async function createDocumentStructure(
  data: DocumentStructureData,
  memory: JordanMemoryManager
): Promise<DocumentStructureResult> {
  const { owner, repo, projectName, organization = "Infinisoft-inc" } = data;

  try {
  console.log(`📁 Creating document structure for ${projectName}...`);

    // Get authenticated GitHub client
    const dopplerToken = process.env.DOPPLER_TOKEN;
    if (!dopplerToken) {
      throw new Error('DOPPLER_TOKEN environment variable not found');
    }

    const githubSetupResult = await createGitHubSetup(dopplerToken, organization);


    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;

    // Prepare template variables
    const templateVariables: TemplateVariables = {
      projectName,
      organization,
      date: new Date().toISOString().split('T')[0]
    };

    // Load all templates using the template loader
    console.log(`📄 Loading templates with variables:`, templateVariables);
    const templateConfig = getStandardTemplateConfig(templateVariables);
    const filesToCreate = await loadTemplates(templateConfig);

    const filesCreated: string[] = [];

    for (const file of filesToCreate) {
      try {
        // First, try to get the existing file to get its SHA for updates
        let sha: string | undefined;
        try {
          const existingFile = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path
          });

          if ('sha' in existingFile.data) {
            sha = existingFile.data.sha;
            console.log(`📝 Updating existing file: ${file.path}`);
          }
        } catch (getError: any) {
          if (getError.status === 404) {
            console.log(`📄 Creating new file: ${file.path}`);
          } else {
            console.warn(`⚠️ Could not check if ${file.path} exists:`, getError.message);
          }
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: file.path,
          message: sha
            ? `docs: Update ${file.path} with AI-SDLC methodology`
            : `docs: Add ${file.path} for AI-SDLC methodology`,
          content: Buffer.from(file.content).toString('base64'),
          sha, // Include SHA for updates
          committer: {
            name: 'Jordan - AI Project Manager',
            email: 'jordan@infinisoft.world'
          },
          author: {
            name: 'Jordan - AI Project Manager',
            email: 'jordan@infinisoft.world'
          }
        });

        filesCreated.push(file.path);
        console.log(`✅ ${sha ? 'Updated' : 'Created'}: ${file.path}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error: any) {
        console.error(`❌ Failed to ${file.path.includes('README.md') ? 'update' : 'create'} ${file.path}:`, error.message);
      }
    }

    const summary = `🎉 **AI-SDLC Document Structure Created Successfully!**

**Project:** ${projectName}
**Repository:** https://github.com/${owner}/${repo}

**📁 Files Created:** ${filesCreated.length}
${filesCreated.map(file => `- ✅ ${file}`).join('\n')}

**🎯 Ready for AI-SDLC Workflow:**
- **Professional README** - Showcases AI-SDLC methodology
- **Complete Templates** - Ready for Sarah and Alex to use
- **Discussion-Based Workflow** - Human-AI collaboration framework
- **Phase Structure** - Clear progression from planning to implementation

**🚀 Next Steps:**
1. **Sarah** can start Business Case discussions using the templates
2. **Alex** can begin Architecture discussions when ready
3. **Human oversight** at each phase for approval
4. **Jordan** tracks progress through GitHub project board

Your AI-SDLC project is now fully structured and ready for collaborative development!`;

    // Update memory
    memory.updateProject({
      name: projectName,
      phase: "Document Structure Created",
      status: "Ready for AI Collaboration",
      currentFocus: "Templates and workflow established",
      githubUrl: `https://github.com/${owner}/${repo}`
    });

    return {
      success: true,
      data: {
        filesCreated,
        summary
      }
    };

  } catch (error) {
    console.error('Document structure creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}



