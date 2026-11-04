# T02 — Wire auto-commit into orchestrate + CLAUDE.md

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** – (T01 creates the `commit` skill in parallel; only reference it by name)

## Brief

### Goal

Make the orchestrator commit automatically via the `commit` skill when it closes a plan. Update the repo conventions to match.

### Scope

- Edit `.claude/skills/orchestrate/SKILL.md`
- Edit `CLAUDE.md`
- Edit `docs/handoffs/README.md` (the Flow list)

### Out of scope

- `.claude/settings.json`, `.claude/hooks/`, `.claude/skills/commit/` (task T01 edits those in parallel — do not touch them).
- `.claude/agents/*` (workers and reviewers keep "never commit").
- Running `git commit`.

### Context to read

- `.claude/skills/orchestrate/SKILL.md`, `CLAUDE.md`, `docs/handoffs/README.md`
- `docs/handoffs/2026-11-04-commit-skill/PLAN.md` → Decisions

### Requirements

**orchestrate SKILL.md, Step 6 (Close):**
- Replace "Do not commit unless the user asked" with a commit step. After the plan outcome is written and the status is set, invoke the **`commit`** skill to commit the plan's changes, including its handoff files. Use one commit per logical change: usually one per plan, split by task if the plan contains unrelated changes.
- Only commit when every task is `done` and the reviews are `approved`. If the plan ends `blocked`, don't commit; tell the user what's uncommitted.
- The reply to the user includes the commit hash(es) and headers.
- Pure-question prompts (no plan) never commit.
- Add a rule line: never add a Claude/Anthropic co-author or "Generated with Claude Code" attribution to commits.

**CLAUDE.md:**
- Replace "Commit only when the user asks." with: commits are made automatically by the orchestrator via the `commit` skill (Conventional Commits) when a plan closes. Never add Claude as co-author or any Claude attribution. Never push unless asked.
- In the Workflow list, mention that closing a plan commits via `commit`.
- Keep CLAUDE.md short.

**docs/handoffs/README.md:**
- In the Flow, step 6 gets "… and commits via the `commit` skill".

### Acceptance criteria

- [ ] No remaining text says "commit only when the user asks" / "do not commit unless".
- [ ] Orchestrate Step 6 invokes `commit`, with the done/approved precondition and the blocked exception.
- [ ] CLAUDE.md states auto-commit, Conventional Commits, no Claude co-author, and no push.
- [ ] Workers/reviewers still never commit (`.claude/agents/*` untouched).

### Verification

```sh
grep -rn -i "commit" CLAUDE.md .claude/skills/orchestrate/SKILL.md docs/handoffs/README.md .claude/agents/
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Auto-commit is wired in. Orchestrate Step 6 now has a commit step (3) that runs after the Outcome and status are written. It invokes the `commit` skill only when every task is `done` and every review is `approved`, makes one commit per logical change, includes the handoff files, and never pushes. If the plan is `blocked`, nothing is committed and the user is told what is uncommitted. The reply step (4) now lists the commit hash(es) and headers. Pure-question prompts never commit, and a new rule bans any Claude/Anthropic co-author or "Generated with Claude Code" attribution. CLAUDE.md's convention line now states auto-commit via `commit` (Conventional Commits), no Claude attribution and no push. Workflow item 4 was added. Flow step 6 in the handoffs README now mentions the `commit` skill.

### Files changed

- `.claude/skills/orchestrate/SKILL.md`: Step 6 rewritten (new items 3 and 4, plus the pure-question line), and the no-attribution rule added under Rules.
- `CLAUDE.md`: Workflow item 4 added; the "Commit only when the user asks." line replaced.
- `docs/handoffs/README.md`: Flow step 6.

### Verification results

- `grep -rn -i "commit" CLAUDE.md .claude/skills/orchestrate/SKILL.md docs/handoffs/README.md .claude/agents/` returns only the new auto-commit lines, plus `task-worker.md:28` "Never commit, push, ...", which is unchanged.
- `grep -E "commit only when the user asks|do not commit unless"` over the three files finds no match (exit 1).
- `.claude/agents/*` not touched.

### Notes for next tasks

- In README Flow step 6 I put "commits" before "reports to the user", not just appending it. The reply includes the commit hashes, so the commit has to happen first.
- Tasks that change no code get no review. The precondition reads "every review is `approved`", so those tasks don't block the commit.
- The skill is only referenced by the name `commit`. Its existence (T01) was not checked.

### Proposed split

–

---

## Review

_(Filled by task-reviewer.)_
