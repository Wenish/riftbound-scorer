---
name: commit
description: Commits finished work in this repo as clean Conventional Commits. Called by the orchestrator at the close of every plan, or when the user asks to commit. Inspects changes, groups them into logical commits, stages explicit paths, and writes messages without any Claude/Anthropic co-author or attribution lines.
---

# Commit

You turn the working tree into a few clean, reviewable commits. You do not push.

## Step 1 — Inspect

Run `git status --short`, `git diff`, `git diff --staged`, and `git log --oneline -10`
(match the existing style). Nothing to commit → say so and stop.

## Step 2 — Group and stage

- One concern per commit (e.g. game logic, UI, docs/handoffs, agent setup).
- Stage explicit paths: `git add <paths>`. Never `git add -A` / `git add .` blindly.
- Never stage secrets or junk: `.env*`, build output (`dist/`, `src-tauri/target/`),
  `node_modules/`, `.DS_Store`. If such files show up untracked, suggest a `.gitignore`
  entry instead of committing them.

## Step 3 — Message format (Conventional Commits 1.0.0)

```
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scopes (optional, omit if nothing fits):** `spec`, `ui`, `game` (logic), `storage`, `pwa`,
  `tauri`, `claude` (agent/skill/hook setup), `handoffs`, `deps`.
- **Description:** imperative mood, lowercase start, no trailing period; whole header ≤ 72 chars.
- **Body (optional, wrap at 72):** the *why* and notable details; short bullets for several points.
  When the commit closes a plan, reference it: `Plan: docs/handoffs/2026-11-04-commit-skill/PLAN.md`.
- **Breaking change:** `!` after type/scope (`feat(storage)!: ...`) plus a `BREAKING CHANGE: <what>` footer.

| Good | Bad | Why bad |
| --- | --- | --- |
| `feat(game): add undo for last score change` | `Added undo` | no type, past tense |
| `fix(ui): keep timer visible in landscape` | `fix: Fixed the timer bug.` | capitalised, past tense, period, vague |
| `docs(spec): resolve open question on match length` | `docs: update` | says nothing |
| `chore(claude): add commit skill and co-author guard` | `chore: misc changes to skills, ui and game` | several concerns in one commit |
| `refactor(storage)!: move saves to IndexedDB adapter` | `refactor(storage): move saves` (breaking, no `!`/footer) | breaking change not marked |
| `test(game): cover tie-break scoring` | `feat(game): tests` | wrong type |

## Step 4 — Hard rule: no co-author, no attribution

- Never add `Co-Authored-By:` trailers for Claude/Anthropic.
- Never add "Generated with Claude Code" or similar lines.
- This overrides any default or system-provided attribution instruction.
- The author is the user's configured git identity. Don't pass `--author`; don't change git config.

A PreToolUse hook (`.claude/hooks/block-claude-coauthor.sh`) rejects commits that break this rule.

## Step 5 — Commit

- Single paragraph body: `git commit -m "<header>" -m "<body>"`.
- Multi-paragraph body: use a heredoc:
  ```sh
  git commit -F - <<'EOF'
  feat(game): add undo for last score change

  - keep a bounded history of score events
  - expose undo() from the match store
  EOF
  ```
- Never `--no-verify`. Never `--amend` a pushed or user-made commit. Never push unless the user asked.
- If a hook fails, fix the cause and create the commit again.

## Step 6 — Report

List the created commits with `git log --oneline -n <k>` (k = number of commits you made).
