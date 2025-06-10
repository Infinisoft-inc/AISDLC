#!/bin/bash

# Jordan MCP Server GitHub Integration Tests
# Tests real GitHub integration with actual credentials

set -e  # Exit on any error

echo "🔗 Jordan GitHub Integration Test Suite"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test repository (should be a test repo, not production)
TEST_OWNER="Infinisoft-inc"
TEST_REPO="github-test"

# Function to run a test
run_integration_test() {
    local test_name="$1"
    local command="$2"
    local success_pattern="$3"
    local failure_pattern="$4"
    
    echo -e "\n${BLUE}Integration Test: $test_name${NC}"
    echo "Command: $command"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if output=$(eval "$command" 2>&1); then
        if echo "$output" | grep -q "$success_pattern"; then
            echo -e "${GREEN}✅ PASS - Integration successful${NC}"
            echo "Created: $(echo "$output" | grep -o 'https://github.com[^"]*' | head -1)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        elif [[ -n "$failure_pattern" ]] && echo "$output" | grep -q "$failure_pattern"; then
            echo -e "${RED}❌ FAIL - Expected failure: $failure_pattern${NC}"
            echo "Output: $output"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        else
            echo -e "${RED}❌ FAIL - Unexpected output${NC}"
            echo "Output: $output"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL - Command failed${NC}"
        echo "Error: $output"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Check if we have the required environment
echo -e "${YELLOW}Checking environment...${NC}"
if [ ! -f "../../.env" ]; then
    echo -e "${RED}❌ .env file not found. Integration tests require real GitHub credentials.${NC}"
    exit 1
fi

# Build the project first
echo -e "${YELLOW}Building Jordan MCP Server...${NC}"
cd ../..
pnpm build
cd tests/integration

echo -e "\n${YELLOW}Starting GitHub Integration Tests...${NC}"
echo -e "${YELLOW}⚠️  WARNING: These tests will create real GitHub issues in $TEST_OWNER/$TEST_REPO${NC}"
echo -e "${YELLOW}Press Ctrl+C within 5 seconds to cancel...${NC}"
sleep 5

# Integration Test 1: Create Epic Issue
run_integration_test "Create Real Epic Issue" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-epic-issue --tool-arg owner=$TEST_OWNER --tool-arg repo=$TEST_REPO --tool-arg title='[EPIC] Integration Test Epic - $(date +%Y%m%d-%H%M%S)' --tool-arg body='# Integration Test Epic\n\nThis epic was created by Jordan'\''s integration test suite to validate GitHub integration.\n\n## Test Details\n- Created: $(date)\n- Test Suite: GitHub Integration\n- Purpose: Validate epic creation\n\n## Requirements\n- [ ] Epic should be created successfully\n- [ ] Epic should have proper labels\n- [ ] Epic should be linked to project' --tool-arg organization=$TEST_OWNER" \
    "Epic Issue Created Successfully" \
    "GitHub setup failed"

# Integration Test 2: Create Feature Issue
run_integration_test "Create Real Feature Issue" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-feature-issue --tool-arguments '{\"owner\":\"$TEST_OWNER\",\"repo\":\"$TEST_REPO\",\"title\":\"[FEATURE] Integration Test Feature - $(date +%Y%m%d-%H%M%S)\",\"body\":\"# Integration Test Feature\\n\\nThis feature was created by Jordan'\''s integration test suite.\\n\\n## Acceptance Criteria\\n- [ ] Feature should be created successfully\\n- [ ] Feature should be linked to parent epic\\n- [ ] Feature should have proper labels\\n\\n## Implementation Notes\\n- This is a test feature\\n- Created by automated integration test\",\"parentEpicNumber\":1,\"labels\":[\"feature\",\"integration-test\"]}'" \
    "Successfully created feature" \
    "GitHub setup failed"

# Integration Test 3: Create Task Issue  
run_integration_test "Create Real Task Issue" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-task-issue --tool-arguments '{\"owner\":\"$TEST_OWNER\",\"repo\":\"$TEST_REPO\",\"title\":\"[TASK] Integration Test Task - $(date +%Y%m%d-%H%M%S)\",\"body\":\"# Integration Test Task\\n\\nThis task was created by Jordan'\''s integration test suite.\\n\\n## Implementation Details\\n- Validate task creation\\n- Test GitHub API integration\\n- Verify proper labeling\\n\\n## Definition of Done\\n- [ ] Task created successfully\\n- [ ] Task linked to parent feature\\n- [ ] Proper labels applied\",\"parentFeatureNumber\":2,\"labels\":[\"task\",\"integration-test\"]}'" \
    "Successfully created task" \
    "GitHub setup failed"

# Integration Test 4: Create Project Structure
run_integration_test "Create Real Project Structure" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-project-structure --tool-arguments '{\"projectName\":\"Jordan Integration Test Project - $(date +%Y%m%d-%H%M%S)\",\"srsContent\":\"# Software Requirements Specification\\n\\n## 1. Introduction\\nThis is an integration test project created by Jordan'\''s automated test suite to validate the complete project creation workflow.\\n\\n## 2. Functional Requirements\\n\\n### FR-001: Integration Testing\\nThe system shall successfully create a complete project structure including:\\n- Epic issues for major features\\n- Feature issues for specific functionality\\n- Task issues for implementation work\\n\\n### FR-002: GitHub Integration\\nThe system shall integrate with GitHub to:\\n- Create issues with proper hierarchy\\n- Apply appropriate labels\\n- Link related issues\\n\\n## 3. Non-Functional Requirements\\n\\n### NFR-001: Automation\\nThe project creation process shall be fully automated through Jordan'\''s MCP interface.\\n\\n### NFR-002: Traceability\\nAll created issues shall maintain proper parent-child relationships for traceability.\"}'" \
    "Successfully created project structure" \
    "GitHub setup failed"

# Print Results
echo -e "\n${YELLOW}======================================${NC}"
echo -e "${YELLOW}Integration Test Results Summary${NC}"
echo -e "${YELLOW}======================================${NC}"
echo -e "Tests Run: $TESTS_RUN"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All integration tests passed! GitHub integration is working correctly.${NC}"
    echo -e "${GREEN}✅ Jordan is ready for production deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some integration tests failed. GitHub integration needs attention.${NC}"
    echo -e "${RED}🚫 Do NOT deploy to production until integration issues are resolved.${NC}"
    exit 1
fi
