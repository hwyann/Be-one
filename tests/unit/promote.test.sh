#!/bin/bash
set -e

PASS=0
FAIL=0
SCRIPT="$(cd "$(dirname "$0")/../.."; pwd)/scripts/check-ff.sh"

pass() { echo "PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cd "$TMPDIR"
git init -q
git config user.email "test@test.com"
git config user.name "Test"

echo "base" > file.txt
git add .
git commit -q -m "base"
PROD_SHA=$(git rev-parse HEAD)

echo "main" >> file.txt
git add .
git commit -q -m "main ahead"
MAIN_SHA=$(git rev-parse HEAD)

# Production is an ancestor of main — FF is possible
if bash "$SCRIPT" "$PROD_SHA" "$MAIN_SHA"; then
  pass "FF possible: production is ancestor of main"
else
  fail "FF possible: production is ancestor of main"
fi

# Production has diverged — FF must be rejected
git checkout -q -b diverged "$PROD_SHA"
echo "diverged" >> file.txt
git add .
git commit -q -m "diverged commit"
DIV_SHA=$(git rev-parse HEAD)

if bash "$SCRIPT" "$DIV_SHA" "$MAIN_SHA" 2>/dev/null; then
  fail "FF rejected: production has diverged"
else
  pass "FF rejected: production has diverged"
fi

# Already up to date — FF is a no-op and must succeed
if bash "$SCRIPT" "$MAIN_SHA" "$MAIN_SHA"; then
  pass "FF no-op: production already at main"
else
  fail "FF no-op: production already at main"
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
