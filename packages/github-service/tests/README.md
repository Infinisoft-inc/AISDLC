# GitHub Service Tests

Comprehensive test suite for the refactored GitHub service with pure SRP architecture.

## Test Structure

### 🔬 Atomic Function Tests (`tests/atomic/`)
Tests individual atomic functions in isolation:
- **`issues.test.ts`** - Tests issue creation, retrieval, labeling
- **`branches.test.ts`** - Tests branch creation, linking, retrieval

### 🧩 Composition Function Tests (`tests/compositions/`)
Tests composition functions that preserve customizations:
- **`epic.test.ts`** - Tests Epic creation with all customizations
- **`feature.test.ts`** - Tests Feature creation and Epic linking
- **`task.test.ts`** - Tests Task creation and Feature linking

### 🔄 Integration Tests (`tests/integration/`)
Tests complete workflows and real API integrations:
- **`full-workflow.test.ts`** - Tests Epic → Feature → Task hierarchy

## Setup

1. **Copy test environment file:**
   ```bash
   cp .env.test .env.test.local
   ```

2. **Fill in your test credentials in `.env.test.local`:**
   ```bash
   DOPPLER_TOKEN=your-actual-doppler-token
   TEST_ORGANIZATION=your-test-organization
   TEST_REPOSITORY=your-test-repository
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test categories
pnpm test:atomic          # Atomic function tests only
pnpm test:compositions    # Composition function tests only
pnpm test:integration     # Integration tests only

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DOPPLER_TOKEN` | Your Doppler API token | `dp.st.prd.xxx...` |
| `TEST_ORGANIZATION` | GitHub organization for testing | `Infinisoft-inc` |
| `TEST_REPOSITORY` | GitHub repository for testing | `test-repo` |
| `EXPECTED_INSTALLATION_ID` | Expected installation ID (optional) | `70009309` |

## Test Features

### ✅ Real API Integration
- Tests make real calls to GitHub API
- Uses actual Doppler credentials
- Creates real issues, branches, and relationships

### ✅ Comprehensive Coverage
- Tests all atomic functions individually
- Tests all composition functions with customizations
- Tests error handling and edge cases
- Tests complete AI-SDLC workflows

### ✅ Dependency Injection Testing
- Tests pure functions with injected GitHub client
- Validates separation of concerns
- Ensures no hidden dependencies

### ✅ Customization Preservation
- Validates all AI-SDLC hierarchy features
- Tests GitHub issue types and sub-issues
- Tests linked branch creation
- Tests smart fallback mechanisms

## Security Notes

- Never commit `.env.test.local` with real credentials
- Use test/development credentials only
- Ensure test organization has proper permissions
- Clean up test issues after running tests (optional)

## Test Output

Tests provide detailed console output showing:
- ✅ Successful operations with GitHub URLs
- 📁 Created branches and their names
- 🔗 Parent-child relationships
- ⚠️ Graceful fallbacks when features unavailable
- 📊 Summary of created issues and hierarchy
