// Simple file-based storage for MVP
import { promises as fs } from 'fs';
import { join } from 'path';
import type { InstallationData } from './types.js';

const STORAGE_DIR = join(process.cwd(), 'data');
const INSTALLATIONS_FILE = join(STORAGE_DIR, 'installations.json');
const PROJECTS_FILE = join(STORAGE_DIR, 'projects.json');

// Ensure storage directory exists
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Load data from file
async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    await ensureStorageDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Save data to file
async function saveData<T>(filePath: string, data: T[]): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Installation storage functions
export async function saveInstallation(installation: InstallationData): Promise<void> {
  const installations = await loadData<InstallationData>(INSTALLATIONS_FILE);
  
  // Remove existing installation with same ID
  const filtered = installations.filter(i => i.installationId !== installation.installationId);
  
  // Add new installation
  filtered.push(installation);
  
  await saveData(INSTALLATIONS_FILE, filtered);
  console.log(`💾 Saved installation: ${installation.accountLogin} (${installation.installationId})`);
}

export async function getInstallation(installationId?: number): Promise<InstallationData | null> {
  const installations = await loadData<InstallationData>(INSTALLATIONS_FILE);
  
  if (installationId) {
    return installations.find(i => i.installationId === installationId) || null;
  }
  
  // Return the first (most recent) installation if no ID specified
  return installations[installations.length - 1] || null;
}

export async function getAllInstallations(): Promise<InstallationData[]> {
  return loadData<InstallationData>(INSTALLATIONS_FILE);
}

// Project storage functions
export async function saveProject(projectId: string, projectData: any): Promise<void> {
  const projects = await loadData<any>(PROJECTS_FILE);
  
  // Remove existing project with same ID
  const filtered = projects.filter((p: any) => p.projectId !== projectId);
  
  // Add new project
  filtered.push({ projectId, ...projectData, updatedAt: new Date().toISOString() });
  
  await saveData(PROJECTS_FILE, filtered);
  console.log(`💾 Saved project: ${projectId}`);
}

export async function getProject(projectId: string): Promise<any | null> {
  const projects = await loadData<any>(PROJECTS_FILE);
  return projects.find((p: any) => p.projectId === projectId) || null;
}

export async function getAllProjects(): Promise<any[]> {
  return loadData<any>(PROJECTS_FILE);
}

// Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  try {
    await fs.unlink(INSTALLATIONS_FILE);
    await fs.unlink(PROJECTS_FILE);
    console.log('🗑️ Cleared all storage data');
  } catch (error) {
    // Files might not exist
  }
}
