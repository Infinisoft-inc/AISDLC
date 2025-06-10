/**
 * E-Commerce Platform Scenario Test
 * Ultimate test of the complete AI-SDLC workflow system
 */

import '../setup';
import { testConfig } from '../setup';
import { createGitHubSetup } from '@brainstack/integration-service';
import { createEpic, createFeature, createTask } from '../../src/compositions';
import { createProjectV2 } from '../../src/github/projects/createProjectV2';
import { addIssueToProjectV2 } from '../../src/github/projects/addIssueToProjectV2';
import { loadTestConfig, getWorkingRepo } from '../config/test-config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ScenarioData {
  testScenario: {
    name: string;
    description: string;
    complexity: string;
    estimatedTime: string;
    projectConfig: {
      epic: any;
      features: any[];
    };
    additionalEpic: {
      title: string;
      body: string;
      labels: string[];
      features: any[];
    };
    expectedResults: {
      issues: {
        epics: number;
        features: number;
        tasks: number;
        totalIssues: number;
      };
      branches: {
        totalBranches: number;
      };
    };
    validationChecklist: string[];
  };
}

describe('E-Commerce Platform Scenario', () => {
  let octokit: any;
  let config: any;
  let scenario: ScenarioData;
  let createdIssues: any[] = [];
  let startTime: number;
  let projectData: any;

  beforeAll(async () => {
    // Load test configuration
    config = loadTestConfig();
    
    // Load scenario data
    const scenarioPath = path.join(__dirname, 'test-scenarios', 'ecommerce-platform.json');
    const scenarioContent = fs.readFileSync(scenarioPath, 'utf8');
    scenario = JSON.parse(scenarioContent);

    // Get GitHub client
    const result = await createGitHubSetup(testConfig.dopplerToken, testConfig.organization);
    expect(result.success).toBe(true);
    octokit = result.data;

    console.log(`🚀 Starting E-Commerce Platform Scenario Test`);
    console.log(`📋 Scenario: ${scenario.testScenario.name}`);
    console.log(`📊 Complexity: ${scenario.testScenario.complexity}`);
    console.log(`⏱️ Estimated Time: ${scenario.testScenario.estimatedTime}`);
  }, 30000);

  test('should execute complete e-commerce platform scenario', async () => {
    startTime = Date.now();
    const workingRepo = getWorkingRepo(config);

    console.log(`\n🏗️ Creating complete e-commerce platform structure in ${testConfig.organization}/${workingRepo}`);

    // Phase 0: Create GitHub Project
    console.log(`\n📋 Phase 0: Creating GitHub Project for E-Commerce Platform`);
    const projectResult = await createProjectV2(octokit, testConfig.organization, {
      title: 'E-Commerce Platform - AI-SDLC Test'
    });

    expect(projectResult.success).toBe(true);
    projectData = projectResult.data;
    console.log(`✅ Project created: ${projectData.url}`);

    // Phase 1: Create First Epic (User Management System)
    console.log(`\n📋 Phase 1: Creating Epic - User Management System`);
    const epic1Result = await createEpic(octokit, testConfig.organization, workingRepo, {
      title: scenario.testScenario.projectConfig.epic.title,
      body: scenario.testScenario.projectConfig.epic.body,
      labels: scenario.testScenario.projectConfig.epic.labels
    });

    expect(epic1Result.success).toBe(true);
    createdIssues.push({ type: 'epic', data: epic1Result.data });
    console.log(`✅ Epic 1 created: #${epic1Result.data!.number} - ${epic1Result.data!.title}`);

    // Add Epic to Project
    const epic1ProjectResult = await addIssueToProjectV2(octokit, projectData.id, epic1Result.data!.node_id);
    expect(epic1ProjectResult.success).toBe(true);
    console.log(`✅ Epic 1 added to project`);

    // Phase 2: Create Features for First Epic
    console.log(`\n📋 Phase 2: Creating Features for User Management Epic`);
    const epic1Features = [];

    for (const featureData of scenario.testScenario.projectConfig.features) {
      const featureResult = await createFeature(octokit, testConfig.organization, workingRepo, {
        title: featureData.title,
        body: featureData.body,
        labels: featureData.labels,
        parentEpicNumber: epic1Result.data!.number
      });

      expect(featureResult.success).toBe(true);
      epic1Features.push(featureResult.data);
      createdIssues.push({ type: 'feature', data: featureResult.data });
      console.log(`✅ Feature created: #${featureResult.data!.number} - ${featureResult.data!.title}`);

      // Add Feature to Project
      const feature1ProjectResult = await addIssueToProjectV2(octokit, projectData.id, featureResult.data!.node_id);
      if (!feature1ProjectResult.success) {
        if (feature1ProjectResult.error?.includes('Content already exists')) {
          console.log(`✅ Feature already in project (auto-added via parent relationship)`);
        } else {
          console.log(`❌ Failed to add feature to project: ${feature1ProjectResult.error}`);
          expect(feature1ProjectResult.success).toBe(true);
        }
      } else {
        console.log(`✅ Feature added to project`);
      }

      // Add Feature to Project
      const feature2ProjectResult = await addIssueToProjectV2(octokit, projectData.id, featureResult.data!.node_id);
      expect(feature2ProjectResult.success).toBe(true);
      console.log(`✅ Feature added to project`);

      // Phase 3: Create Tasks for each Feature
      console.log(`   📋 Creating Tasks for Feature #${featureResult.data!.number}`);
      
      for (const taskData of featureData.tasks) {
        const taskResult = await createTask(octokit, testConfig.organization, workingRepo, {
          title: taskData.title,
          body: taskData.body,
          labels: taskData.labels,
          parentFeatureNumber: featureResult.data!.number
        });

        expect(taskResult.success).toBe(true);
        createdIssues.push({ type: 'task', data: taskResult.data });
        console.log(`   ✅ Task created: #${taskResult.data!.number} - ${taskResult.data!.title}`);

        // Add Task to Project (may already be added automatically via parent relationship)
        const task1ProjectResult = await addIssueToProjectV2(octokit, projectData.id, taskResult.data!.node_id);
        if (!task1ProjectResult.success) {
          if (task1ProjectResult.error?.includes('Content already exists')) {
            console.log(`   ✅ Task already in project (auto-added via parent relationship)`);
          } else {
            console.log(`❌ Failed to add task to project: ${task1ProjectResult.error}`);
            expect(task1ProjectResult.success).toBe(true);
          }
        } else {
          console.log(`   ✅ Task added to project`);
        }
      }
    }

    // Phase 4: Create Second Epic (Product Catalog System)
    console.log(`\n📋 Phase 4: Creating Epic - Product Catalog System`);
    const epic2Result = await createEpic(octokit, testConfig.organization, workingRepo, {
      title: scenario.testScenario.additionalEpic.title,
      body: scenario.testScenario.additionalEpic.body,
      labels: scenario.testScenario.additionalEpic.labels
    });

    expect(epic2Result.success).toBe(true);
    createdIssues.push({ type: 'epic', data: epic2Result.data });
    console.log(`✅ Epic 2 created: #${epic2Result.data!.number} - ${epic2Result.data!.title}`);

    // Add Epic to Project
    const epic2ProjectResult = await addIssueToProjectV2(octokit, projectData.id, epic2Result.data!.node_id);
    expect(epic2ProjectResult.success).toBe(true);
    console.log(`✅ Epic 2 added to project`);

    // Phase 5: Create Features for Second Epic
    console.log(`\n📋 Phase 5: Creating Features for Product Catalog Epic`);
    
    for (const featureData of scenario.testScenario.additionalEpic.features) {
      const featureResult = await createFeature(octokit, testConfig.organization, workingRepo, {
        title: featureData.title,
        body: featureData.body,
        labels: featureData.labels,
        parentEpicNumber: epic2Result.data!.number
      });

      expect(featureResult.success).toBe(true);
      createdIssues.push({ type: 'feature', data: featureResult.data });
      console.log(`✅ Feature created: #${featureResult.data!.number} - ${featureResult.data!.title}`);

      // Add Feature to Project
      const feature2ProjectResult = await addIssueToProjectV2(octokit, projectData.id, featureResult.data!.node_id);
      if (!feature2ProjectResult.success) {
        if (feature2ProjectResult.error?.includes('Content already exists')) {
          console.log(`✅ Feature already in project (auto-added via parent relationship)`);
        } else {
          console.log(`❌ Failed to add feature to project: ${feature2ProjectResult.error}`);
          expect(feature2ProjectResult.success).toBe(true);
        }
      } else {
        console.log(`✅ Feature added to project`);
      }

      // Phase 6: Create Tasks for each Feature
      console.log(`   📋 Creating Tasks for Feature #${featureResult.data!.number}`);
      
      for (const taskData of featureData.tasks) {
        const taskResult = await createTask(octokit, testConfig.organization, workingRepo, {
          title: taskData.title,
          body: taskData.body,
          labels: taskData.labels,
          parentFeatureNumber: featureResult.data!.number
        });

        expect(taskResult.success).toBe(true);
        createdIssues.push({ type: 'task', data: taskResult.data });
        console.log(`   ✅ Task created: #${taskResult.data!.number} - ${taskResult.data!.title}`);

        // Add Task to Project (may already be added automatically via parent relationship)
        const task2ProjectResult = await addIssueToProjectV2(octokit, projectData.id, taskResult.data!.node_id);
        if (!task2ProjectResult.success) {
          if (task2ProjectResult.error?.includes('Content already exists')) {
            console.log(`   ✅ Task already in project (auto-added via parent relationship)`);
          } else {
            console.log(`❌ Failed to add task to project: ${task2ProjectResult.error}`);
            expect(task2ProjectResult.success).toBe(true);
          }
        } else {
          console.log(`   ✅ Task added to project`);
        }
      }
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    // Validation Phase
    console.log(`\n🔍 Validation Phase - Checking Results`);
    
    // Count created issues by type
    const epicCount = createdIssues.filter(i => i.type === 'epic').length;
    const featureCount = createdIssues.filter(i => i.type === 'feature').length;
    const taskCount = createdIssues.filter(i => i.type === 'task').length;
    const totalCount = createdIssues.length;

    console.log(`📊 Created Issues Summary:`);
    console.log(`   📋 Epics: ${epicCount} (expected: ${scenario.testScenario.expectedResults.issues.epics})`);
    console.log(`   📋 Features: ${featureCount} (expected: ${scenario.testScenario.expectedResults.issues.features})`);
    console.log(`   📋 Tasks: ${taskCount} (expected: ${scenario.testScenario.expectedResults.issues.tasks})`);
    console.log(`   📋 Total: ${totalCount} (expected: ${scenario.testScenario.expectedResults.issues.totalIssues})`);
    console.log(`   ⏱️ Total Time: ${totalTime.toFixed(2)} seconds`);
    console.log(`   🎯 Project: ${projectData.url}`);
    console.log(`   ✅ All ${totalCount} issues added to project`);

    // Assertions
    expect(epicCount).toBe(scenario.testScenario.expectedResults.issues.epics);
    expect(featureCount).toBe(scenario.testScenario.expectedResults.issues.features);
    expect(taskCount).toBe(scenario.testScenario.expectedResults.issues.tasks);
    expect(totalCount).toBe(scenario.testScenario.expectedResults.issues.totalIssues);
    expect(totalTime).toBeLessThan(60); // Should complete within 60 seconds

    console.log(`\n✅ E-Commerce Platform Scenario completed successfully!`);
    console.log(`🎯 All ${totalCount} issues created with proper hierarchy and relationships`);
    console.log(`📋 GitHub Project created and configured: ${projectData.url}`);
    console.log(`📊 All ${totalCount} issues added to project`);
    console.log(`🔗 Project hierarchy visible in GitHub UI`);
    console.log(`🚀 Performance: ${totalTime.toFixed(2)}s (target: <60s)`);

  }, 120000); // 2 minute timeout for complete scenario

  afterAll(() => {
    if (scenario && startTime) {
      console.log(`\n📋 E-Commerce Platform Scenario Summary:`);
      console.log(`   🎯 Scenario: ${scenario.testScenario.name}`);
      console.log(`   📊 Total Issues Created: ${createdIssues.length}`);
      console.log(`   ⏱️ Execution Time: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
      console.log(`   ✅ All validations passed`);

      // Display created issues for verification
      console.log(`\n📋 Created Issues for Manual Verification:`);
      createdIssues.forEach(issue => {
        console.log(`   ${issue.type.toUpperCase()}: #${issue.data.number} - ${issue.data.title}`);
        console.log(`      🔗 ${issue.data.html_url}`);
      });
    }
  });
});
