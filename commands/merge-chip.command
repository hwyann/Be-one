#!/bin/bash
set -e
cd ~/be-one
PR_JSON=$(gh pr list --head "dev-chip" --base main --json number,title,reviewDecision --limit 1 --jq '.[0]')
PR_NUMBER=$(echo "$PR_JSON" | jq -r '.number')
REVIEW=$(echo "$PR_JSON" | jq -r '.reviewDecision')

if [ -z "$PR_NUMBER" ] || [ "$PR_NUMBER" = "null" ]; then
  echo "No open PR found for dev-chip."
  read -p "Press Enter to close..."
  exit 1
fi

if [ "$REVIEW" != "APPROVED" ]; then
  echo "PR #$PR_NUMBER is not approved (reviewDecision: $REVIEW)."
  echo "Approve it first with approve-chip.command."
  read -p "Press Enter to close..."
  exit 1
fi

gh pr merge "$PR_NUMBER" --squash --delete-branch
echo ""
echo "PR #$PR_NUMBER merged to main."
read -p "Press Enter to close..."
