#!/bin/bash
# Validates that <prod_sha> is an ancestor of <main_sha> (fast-forward safe).
# Usage: check-ff.sh <prod_sha> <main_sha>
# Exit 0 = FF possible; exit 1 = diverged (FF would overwrite history).
set -e

PROD_SHA="$1"
MAIN_SHA="$2"

if [ -z "$PROD_SHA" ] || [ -z "$MAIN_SHA" ]; then
  echo "Usage: check-ff.sh <prod_sha> <main_sha>" >&2
  exit 2
fi

if ! git merge-base --is-ancestor "$PROD_SHA" "$MAIN_SHA"; then
  echo "ERROR: production ($PROD_SHA) is not an ancestor of main ($MAIN_SHA). Fast-forward not possible." >&2
  exit 1
fi
