import * as fs from 'fs';

export type Persona = {
  name: string;
  title: string;
  description: string;
  tone: string;
  avatar: string;
  memory_scope: string;
}

/**
 * Load persona configuration from a config file or return default
 * @param configPath - Path to the persona config file
 * @param defaultPersona - Default persona to use if config not found
 * @returns Persona configuration
 */
export function loadPersona(configPath: string, defaultPersona: Persona): Persona {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Could not load persona config:', error);
  }

  return defaultPersona;
}
