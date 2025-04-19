#!/bin/bash

# Script to add a sub-issue to a parent issue using the GitHub REST API
# Usage: ./add-sub-issue.sh <parent_issue_number> <child_issue_number>

if [ $# -ne 2 ]; then
  echo "Usage: $0 <parent_issue_number> <child_issue_number>"
  exit 1
fi

PARENT_ISSUE_NUMBER=$1
CHILD_ISSUE_NUMBER=$2

# Get repository information from git config
REPO_OWNER=$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\).*/\1/p')
REPO_NAME=$(git config --get remote.origin.url | sed -n 's/.*github.com[:/][^/]*\/\([^.]*\).*/\1/p')

if [ -z "$REPO_OWNER" ] || [ -z "$REPO_NAME" ]; then
  echo "Error: Could not determine repository owner and name from git config"
  echo "Please run this script from within a git repository with a GitHub remote"
  exit 1
fi

echo "Repository: $REPO_OWNER/$REPO_NAME"

# Get the internal ID of the child issue
CHILD_ISSUE_ID=$(gh api repos/$REPO_OWNER/$REPO_NAME/issues/$CHILD_ISSUE_NUMBER --jq .id)

if [ -z "$CHILD_ISSUE_ID" ]; then
  echo "Error: Could not get the ID of issue #$CHILD_ISSUE_NUMBER"
  exit 1
fi

echo "Adding issue #$CHILD_ISSUE_NUMBER (ID: $CHILD_ISSUE_ID) as a sub-issue to issue #$PARENT_ISSUE_NUMBER"

# Add the child issue as a sub-issue to the parent issue
RESPONSE=$(gh api repos/$REPO_OWNER/$REPO_NAME/issues/$PARENT_ISSUE_NUMBER/sub_issues -X POST -F sub_issue_id=$CHILD_ISSUE_ID)

if [ $? -eq 0 ]; then
  echo "Success! Issue #$CHILD_ISSUE_NUMBER is now a sub-issue of issue #$PARENT_ISSUE_NUMBER"
else
  echo "Error: Failed to add issue #$CHILD_ISSUE_NUMBER as a sub-issue to issue #$PARENT_ISSUE_NUMBER"
  echo "$RESPONSE"
  exit 1
fi
