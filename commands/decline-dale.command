#!/bin/bash
set -e
cd ~/be-one
PR=$(gh pr list --head "dev-dale" --base main --json number --limit 1 --jq '.[0].number')
if [ -z "$PR" ] || [ "$PR" = "null" ]; then
  echo "No open PR found for dev-dale."
  read -p "Press Enter to close..."
  exit 1
fi
if [ ! -f .review-body.md ]; then
  echo ".review-body.md not found — Claude writes this before you run decline."
  read -p "Press Enter to close..."
  exit 1
fi
echo "--- Review body ---"
cat .review-body.md
echo ""
echo "-------------------"
read -p "Submit as-is? (y/n): " CONFIRM
if [ "$CONFIRM" = "y" ]; then
  gh pr review "$PR" --request-changes --body "$(cat .review-body.md)"
  echo "PR #$PR: changes requested."
else
  echo "Cancelled."
fi
read -p "Press Enter to close..."
