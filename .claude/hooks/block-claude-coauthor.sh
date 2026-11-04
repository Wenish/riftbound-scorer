#!/bin/sh
# PreToolUse hook (Bash): block `git commit` commands that carry a Claude/Anthropic
# co-author trailer or a "Generated with Claude Code" attribution line.
# Exit 2 = block (reason on stderr); exit 0 = allow.

input=$(cat)

# Only inspect git commit commands (also matches `git -C dir commit ...`).
printf '%s' "$input" | grep -Eq 'git([[:space:]]+[^[:space:]]+)*[[:space:]]+commit([^[:alnum:]-]|$)' || exit 0

if printf '%s' "$input" | grep -Eiq 'co-authored-by:.{0,200}(claude|anthropic)'; then
  echo "Commits in this repo must not include a Claude co-author trailer. Remove it and commit again." >&2
  exit 2
fi

if printf '%s' "$input" | grep -Eiq 'generated (with|by) \[?claude'; then
  echo "Commits in this repo must not include a 'Generated with Claude Code' attribution line. Remove it and commit again." >&2
  exit 2
fi

exit 0
