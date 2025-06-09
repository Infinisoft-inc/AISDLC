# Integration Service Tests

Comprehensive integration tests for the integration service package.

## Setup

1. **Copy test environment file:**
   ```bash
   cp .env.test .env.test.local
   ```

2. **Fill in your test credentials in `.env.test.local`:**
   ```bash
   DOPPLER_TOKEN=your-actual-doppler-token
   TEST_ORGANIZATION=your-test-organization
   EXPECTED_INSTALLATION_ID=your-expected-installation-id
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test doppler.test.ts
```

## Test Structure

### `doppler.test.ts`
- Tests Doppler secret retrieval
- Validates Supabase and GitHub credentials
- Tests error handling for invalid tokens

### `supabase.test.ts`
- Tests Supabase client creation
- Tests organization lookup functionality
- Tests listing all organizations
- Tests error handling for non-existent organizations

### `github.test.ts`
- Tests GitHub App client creation
- Tests GitHub installation client creation
- Tests repository access
- Tests error handling for invalid installation IDs

### `integration.test.ts`
- End-to-end integration tests
- Tests convenience functions
- Tests complete GitHub setup workflow
- Tests error scenarios

## Test Requirements

- **No hardcoded secrets** - All credentials from environment variables
- **Real API calls** - Tests actual integration with external services
- **Error handling** - Tests both success and failure scenarios
- **Comprehensive coverage** - Tests all major functions and edge cases

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DOPPLER_TOKEN` | Your Doppler API token | `dp.st.prd.xxx...` |
| `TEST_ORGANIZATION` | GitHub organization for testing | `Infinisoft-inc` |
| `EXPECTED_INSTALLATION_ID` | Expected installation ID (optional) | `70009309` |
| `DOPPLER_PROJECT` | Doppler project name (optional) | `ai-sdlc` |
| `DOPPLER_CONFIG` | Doppler config name (optional) | `prd` |

## Security Notes

- Never commit `.env.test.local` with real credentials
- Use test/development credentials only
- Ensure test organization has proper permissions
- Rotate tokens regularly
