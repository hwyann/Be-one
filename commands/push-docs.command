#!/bin/bash
set -e
cd ~/be-one
git add CLAUDE.md documents/
if git diff --cached --quiet; then
  echo "Nothing new to push."
  read -p "Press Enter to close..."
  exit 0
fi
git commit -m "chore: persist PM docs"
git push origin main
echo ""
echo "Done — PM docs pushed to origin/main."
read -p "Press Enter to close..."
