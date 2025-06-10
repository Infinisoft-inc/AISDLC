#!/bin/bash

# Jordan MCP Server Automated Test Suite
# Tests all tools, prompts, and resources using MCP Inspector CLI

set -e  # Exit on any error

echo "🧪 Jordan MCP Server Test Suite"
echo "================================"

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

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "Command: $command"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if output=$(eval "$command" 2>&1); then
        if [[ -z "$expected_pattern" ]] || echo "$output" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL - Expected pattern not found: $expected_pattern${NC}"
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

# Build the project first
echo -e "${YELLOW}Building Jordan MCP Server...${NC}"
cd ../..
pnpm build
cd tests/unit

echo -e "\n${YELLOW}Starting Jordan MCP Server Tests...${NC}"

# Test 1: List Tools
run_test "List Tools" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/list" \
    "complete-training"

# Test 2: List Prompts  
run_test "List Prompts" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method prompts/list" \
    "jordan-introduction"

# Test 3: List Resources
run_test "List Resources" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method resources/list" \
    "jordan://memory/current"

# Test 4: Get Jordan Introduction Prompt
run_test "Get Jordan Introduction" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method prompts/get --prompt-name jordan-introduction" \
    "Jordan"

# Test 5: Get Training Status Prompt
run_test "Get Training Status" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method prompts/get --prompt-name jordan-training-status" \
    "Training"

# Test 6: Read Memory Resource
run_test "Read Memory Resource" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method resources/read --uri jordan://memory/current" \
    "conversations"

# Test 7: Read Training Resource
run_test "Read Training Resource" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method resources/read --uri jordan://training/status" \
    "completed"

# Test 8: Complete Training Tool
run_test "Complete Training" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name complete-training" \
    "Training"

# Test 9: Process Message Tool
run_test "Process Message for Jordan" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name process-message-for-jordan --tool-arg message='Hello Jordan' --tool-arg context=test" \
    "Jordan"

# Test 10: Get Project Status
run_test "Get Project Status" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name get-project-status" \
    "JORDAN"

# Test 11: Create Epic Issue (with mock data)
run_test "Create Epic Issue" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-epic-issue --tool-arg owner=test-org --tool-arg repo=test-repo --tool-arg title='Test Epic' --tool-arg body='Test epic description'" \
    "Not Found"  # Expected since test-org/test-repo doesn't exist

# Test 12: Create Feature Issue (with mock data)
run_test "Create Feature Issue" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-feature-issue --tool-arg owner=test-org --tool-arg repo=test-repo --tool-arg title='Test Feature' --tool-arg body='Test feature description' --tool-arg parentEpicNumber=1" \
    "Not Found"  # Expected since test-org/test-repo doesn't exist

# Test 13: Create Task Issue (with mock data)
run_test "Create Task Issue" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-task-issue --tool-arg owner=test-org --tool-arg repo=test-repo --tool-arg title='Test Task' --tool-arg body='Test task description' --tool-arg parentFeatureNumber=1" \
    "Not Found"  # Expected since test-org/test-repo doesn't exist

# Test 14: Create Project Structure (with mock data)
run_test "Create Project Structure" \
    "npx @modelcontextprotocol/inspector --cli node ../../dist/index.js --method tools/call --tool-name create-project-structure --tool-arg projectName='Test Project' --tool-arg srsContent='Test SRS content'" \
    "Integration Error"  # Expected since we don't have repo creation permissions

# Print Results
echo -e "\n${YELLOW}================================${NC}"
echo -e "${YELLOW}Test Results Summary${NC}"
echo -e "${YELLOW}================================${NC}"
echo -e "Tests Run: $TESTS_RUN"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Jordan MCP Server is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Check the output above for details.${NC}"
    exit 1
fi
