# Integration Service

Lightweight functional client factory for Doppler, Supabase, and GitHub integrations.

## Design Principles

- **Functional Programming**: Pure functions, no classes
- **Single Responsibility**: One function per file
- **Lightweight**: Minimal dependencies
- **Client Factory Pattern**: Provide credentials, get authenticated clients
- **Secret Management**: Encapsulated Doppler integration

## Usage

### Quick Setup

```typescript
import { createGitHubSetup } from '@brainstack/integration-service';

// Get complete GitHub setup for organization
const result = await createGitHubSetup('your-doppler-token', 'Infinisoft-inc');

if (result.success) {
  const githubClient = result.data;
  // Use authenticated GitHub client
}
```

### Individual Functions

```typescript
import {
  getSupabaseCredentials,
  createSupabaseClient,
  getInstallationIdByOrg,
  getGitHubCredentials,
  createGitHubInstallationClient
} from '@brainstack/integration-service';

// Get Supabase credentials from Doppler
const supabaseCredsResult = await getSupabaseCredentials({ 
  token: 'your-doppler-token' 
});

// Create Supabase client
const supabaseClient = createSupabaseClient(supabaseCredsResult.data);

// Get installation ID
const tenantResult = await getInstallationIdByOrg(supabaseClient, 'Infinisoft-inc');

// Get GitHub credentials
const githubCredsResult = await getGitHubCredentials({ 
  token: 'your-doppler-token' 
});

// Create GitHub client
const githubClientResult = await createGitHubInstallationClient(
  githubCredsResult.data,
  tenantResult.data.installationId
);
```

## Functions

### Doppler Functions
- `getSupabaseCredentials(config)` - Get Supabase URL and service key
- `getGitHubCredentials(config)` - Get GitHub App credentials

### Supabase Functions  
- `createSupabaseClient(credentials)` - Create authenticated Supabase client
- `getInstallationIdByOrg(client, orgName)` - Query installation ID
- `listOrganizations(client)` - List all organizations

### GitHub Functions
- `createGitHubClient(credentials)` - Create GitHub App client
- `createGitHubInstallationClient(credentials, installationId)` - Create installation client

### Convenience Functions
- `getInstallationId(dopplerToken, orgName)` - One-shot installation ID lookup
- `createGitHubSetup(dopplerToken, orgName)` - Complete GitHub client setup

## Error Handling

All functions return `IntegrationResult<T>`:

```typescript
interface IntegrationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```
