# Commit skill (Conventional Commits, no Claude co-author)

- **Created:** 2026-11-04
- **Status:** done
- **Request:** "can you also add a skill which automaticly makes commit like conventional commits nicly and never add claude as co author"

## Goal

Finished work is committed automatically with well-formed Conventional Commit messages. No commit ever carries a Claude/Anthropic co-author trailer, and this is enforced, not just documented.

## Context

- `.claude/skills/orchestrate/SKILL.md` (Step 6 currently says "Do not commit unless the user asked")
- `CLAUDE.md` (Conventions: "Commit only when the user asks")
- `.claude/settings.json`, `.claude/hooks/`

## Tasks

| ID  | Title                                              | Depends on | Status |
| --- | -------------------------------------------------- | ---------- | ------ |
| T01 | `commit` skill + co-author guard hook + settings   | –          | done   |
| T02 | Wire auto-commit into orchestrate + CLAUDE.md      | –          | done   |

## Decisions

- Commits happen automatically at the close of every plan, made by the orchestrator via the `commit` skill. Workers and reviewers still never commit. — user ("automatically"); orchestrator: one place that sees the whole change.
- Granularity: one commit per logical change. Usually one per plan; split by task when a plan contains unrelated changes. — orchestrator
- Commit on the current branch, never push unless the user asks. — orchestrator
- No co-author, enforced three ways: skill rules, `"includeCoAuthoredBy": false` in project settings, and a PreToolUse hook that blocks `git commit` commands containing a Claude/Anthropic `Co-Authored-By` trailer. — user ("never")

## Outcome

- `.claude/skills/commit/SKILL.md`: Conventional Commits skill (grouping, staging rules, format, scopes, examples, no attribution).
- `.claude/hooks/block-claude-coauthor.sh` + `PreToolUse` Bash hook: blocks git commits that carry a Claude/Anthropic co-author or attribution line. Verified by worker, reviewer (approved) and orchestrator: bad → exit 2, normal commit / other commands → exit 0.
- `.claude/settings.json`: `includeCoAuthoredBy: false`.
- Orchestrate Step 6, CLAUDE.md and handoffs README: plans close with an automatic commit via `commit`; never push.

Known limitation (accepted): the hook greps the whole tool input, so it falsely blocks any Bash command whose text mentions both a commit and a Claude attribution string — e.g. tests of the hook itself or a heredoc writing docs. Use the Edit/Write tools for such text. It never lets a Claude trailer through.
