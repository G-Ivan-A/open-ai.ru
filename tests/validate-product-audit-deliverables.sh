#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

failures=0

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  failures=$((failures + 1))
}

deliverables=(
  "docs/product/2026-05-25-repository-audit-comparison.md"
  "docs/product/2026-05-25-repository-audit-comparison.html"
  "docs/product/2026-05-25-improvement-roadmap.md"
  "docs/product/2026-05-25-improvement-roadmap.html"
  "docs/product/2026-05-25-implementation-backlog.md"
  "docs/product/2026-05-25-implementation-backlog.html"
  "docs/product/2026-05-25-product-vision-options.md"
  "docs/product/2026-05-25-product-vision-options.html"
)

for path in "${deliverables[@]}"; do
  [[ -s "$path" ]] || fail "missing or empty issue #42 deliverable: $path"
done

markdown_files=(
  "docs/product/2026-05-25-repository-audit-comparison.md"
  "docs/product/2026-05-25-improvement-roadmap.md"
  "docs/product/2026-05-25-implementation-backlog.md"
  "docs/product/2026-05-25-product-vision-options.md"
)

for path in "${markdown_files[@]}"; do
  grep -q "G-Ivan-A/open-ai.ru#42" "$path" || fail "missing issue #42 link in $path"
done

html_files=(
  "docs/product/2026-05-25-repository-audit-comparison.html"
  "docs/product/2026-05-25-improvement-roadmap.html"
  "docs/product/2026-05-25-implementation-backlog.html"
  "docs/product/2026-05-25-product-vision-options.html"
)

for path in "${html_files[@]}"; do
  grep -qi "<!doctype html>" "$path" || fail "missing doctype in $path"
  grep -q "G-Ivan-A/open-ai.ru#42" "$path" || fail "missing issue #42 link in $path"
done

if [[ "$failures" -gt 0 ]]; then
  printf '\nProduct audit deliverables validation failed with %d issue(s).\n' "$failures" >&2
  exit 1
fi

printf 'Product audit deliverables validation passed.\n'
