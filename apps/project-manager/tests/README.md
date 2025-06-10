# Jordan MCP Server Test Suite

This directory contains comprehensive tests for Jordan's MCP server functionality.

## Test Structure

```
tests/
├── unit/                    # Unit tests (no external dependencies)
│   ├── test-jordan.sh      # Quick bash test script
│   ├── run-tests.js        # Advanced Node.js test runner
│   └── test-scenarios.json # Test configuration
└── integration/            # Integration tests (requires real GitHub credentials)
    ├── github-integration.sh    # Basic GitHub integration tests
    └── github-validation.js     # Advanced GitHub validation with issue verification
```

## Test Types

### Unit Tests (`tests/unit/`)
- **Purpose**: Validate MCP server functionality without external dependencies
- **Environment**: Mock/test environment, no real GitHub API calls
- **Speed**: Fast (< 2 minutes)
- **Safety**: Safe to run anytime, no side effects

**What they test:**
- MCP protocol compliance (tools, prompts, resources)
- Tool parameter validation and error handling
- Memory and training system functionality
- Message processing and context building

### Integration Tests (`tests/integration/`)
- **Purpose**: Validate real GitHub integration with actual API calls
- **Environment**: Requires real GitHub credentials and test repository
- **Speed**: Slower (depends on GitHub API)
- **Safety**: Creates real GitHub issues (use test repository only!)

**What they test:**
- Actual GitHub issue creation (Epic, Feature, Task)
- GitHub API authentication and authorization
- Issue linking and project structure creation
- End-to-end workflow validation

## Running Tests

### Quick Unit Tests
```bash
npm run test:unit
# or
npm run test
```

### Advanced Unit Tests
```bash
npm run test:unit:advanced
```

### Integration Tests (⚠️ Creates real GitHub issues!)
```bash
npm run test:integration
```

### Advanced Integration Tests with Validation
```bash
npm run test:integration:validate
```

### Visual Testing (MCP Inspector UI)
```bash
npm run test:ui
```

### All Tests (Unit + Integration)
```bash
npm run test:all
```

### Safe Tests (Unit only)
```bash
npm run test:safe
```

## Environment Setup

### Unit Tests
No special setup required. Tests use mock data and expect GitHub authentication to fail gracefully.

### Integration Tests
Requires real GitHub credentials in `.env` file:

```bash
# .env file
GITHUB_TOKEN=your_github_token_here
# or
DOPPLER_TOKEN=your_doppler_token_here
```

**Test Repository Configuration:**
- Owner: `mouimet-infinisoft`
- Repository: `jordan-test-repo`
- **Important**: Use a dedicated test repository, not production repos!

## Test Results

### Unit Test Results
- ✅ **14/14 tests pass** - Validates MCP server structure and error handling
- Tests expect GitHub authentication failures (this is correct behavior)
- Validates tool parameters, message processing, and memory access

### Integration Test Results
- Creates real GitHub issues with timestamps
- Validates issues exist on GitHub after creation
- Tests complete Epic → Feature → Task hierarchy
- Provides GitHub URLs for created issues

## Continuous Integration

### Pre-deployment Checklist
1. ✅ Run unit tests: `npm run test:unit`
2. ✅ Run integration tests: `npm run test:integration`
3. ✅ Verify all tests pass
4. ✅ Check created GitHub issues are properly formatted
5. ✅ Clean up test issues if needed

### CI/CD Pipeline
```bash
# Safe for CI/CD (no external dependencies)
npm run test:safe

# Full validation (requires GitHub credentials)
npm run test:all
```

## Troubleshooting

### Unit Tests Failing
- Check if project builds: `npm run build`
- Verify MCP server starts: `npm start`
- Check for TypeScript errors

### Integration Tests Failing
- Verify GitHub token in `.env` file
- Check test repository exists and is accessible
- Verify network connectivity to GitHub API
- Check GitHub API rate limits

### Common Issues
1. **"GitHub setup failed"** in unit tests - This is expected and correct
2. **"DOPPLER_TOKEN not found"** in integration tests - Add GitHub token to `.env`
3. **"Repository not found"** - Verify test repository configuration
4. **Rate limit errors** - Wait and retry, or use different GitHub token

## Test Development

### Adding Unit Tests
Edit `tests/unit/test-scenarios.json` to add new test cases.

### Adding Integration Tests
Edit `tests/integration/github-validation.js` to add new GitHub integration scenarios.

### Test Best Practices
- Unit tests should be fast and safe
- Integration tests should use dedicated test repositories
- Always clean up created test data when possible
- Use timestamps in test data to avoid conflicts
