#!/bin/bash
set -e
cd ~/be-one
PR=$(gh pr list --head "dev-chip" --base main --json number --limit 1 --jq '.[0].number')
if [ -z "$PR" ] || [ "$PR" = "null" ]; then
  echo "No open PR found for dev-chip."
  read -p "Press Enter to close..."
  exit 1
fi
gh pr review "$PR" --approve
echo "PR #$PR approved."
read -p "Press Enter to close..."
