#!/bin/bash
set -e
REPO="$HOME/be-one"
WORKTREE="$HOME/Documents/Claude/Worktrees/be-one-chip"

cd "$REPO"
git fetch origin

if [ ! -d "$WORKTREE" ]; then
  mkdir -p "$(dirname "$WORKTREE")"
  git branch dev-chip origin/main 2>/dev/null || true
  git worktree add "$WORKTREE" dev-chip
fi

cd "$WORKTREE"
git reset --hard origin/main

# Symlink track files so PM and Dev share the same file
if [ ! -L "$WORKTREE/documents/tracks" ]; then
  rm -rf "$WORKTREE/documents/tracks"
  ln -sf "$REPO/documents/tracks" "$WORKTREE/documents/tracks"
fi

echo "Chip's worktree ready — reset to origin/main."
echo ""
claude "dev-chip start"
