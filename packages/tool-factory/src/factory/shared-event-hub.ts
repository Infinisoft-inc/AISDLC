/**
 * Shared Event Hub Instance
 * SRP: Single hub instance management only
 */

import { createEventHub } from '@brainstack/hub';

// Create single shared event hub instance
export const sharedEventHub = createEventHub();
