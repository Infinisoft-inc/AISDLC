/**
 * Simple in-memory storage for business case tools
 * Self-contained storage without external dependencies
 */

import type { BusinessCase } from '../business_case';

/**
 * Simple business case storage (in-memory)
 */
export const businessCaseStorage = new Map<string, BusinessCase>();

/**
 * Store business case data
 */
export function storeBusinessCase(data: BusinessCase): { success: boolean; data?: BusinessCase } {
  try {
    businessCaseStorage.set(data.projectId, { ...data });
    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Retrieve business case data
 */
export function getBusinessCase(projectId: string): { success: boolean; data?: BusinessCase } {
  try {
    const data = businessCaseStorage.get(projectId);
    return { success: !!data, data };
  } catch (error) {
    return { success: false };
  }
}
