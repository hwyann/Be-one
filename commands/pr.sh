#!/bin/bash
set -e
TRACK=${1:?"Usage: bash commands/pr.sh <chip|dale>"}
REPO="$HOME/be-one"
WORKTREE="$HOME/Documents/Claude/Worktrees/be-one-$TRACK"
BRANCH="dev-$TRACK"

source ~/.strike-trio/.env

cd "$WORKTREE"

TITLE=$(git log origin/main..HEAD --pretty="%s" | head -1)
BODY=$(git log origin/main..HEAD --pretty="- %s" --reverse)

if [ -z "$TITLE" ]; then
  echo "No commits ahead of origin/main on $BRANCH."
  exit 1
fi

GH_TOKEN=$DEVBOT_TOKEN gh pr create \
  --title "$TITLE" \
  --body "$BODY" \
  --base main \
  --head "$BRANCH" \
  --repo hwyann/be-one

echo ""
echo "PR opened under strike-trio-devbot."
