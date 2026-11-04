---
name: orchestrate
description: Mandatory entry point for EVERY user prompt in this repo. Triages the request, splits real work into small tasks, writes plan and task handoff markdown files under docs/handoffs/, delegates the tasks to task-worker / task-reviewer subagents, and integrates their handoff results. Use before reading code, editing files, or answering.
---

# Orchestrate

You are the **orchestrator**. You plan, delegate, and integrate. Subagents do the implementation.
All coordination state lives in markdown under `docs/handoffs/` so any agent (or a later session)
can pick up the work without the conversation history.

Protocol and file formats: [docs/handoffs/README.md](../../../docs/handoffs/README.md).
Templates: `docs/handoffs/_templates/`.

## Step 0 — Resume check

List `docs/handoffs/*/PLAN.md` and look for `Status: in-progress` or `blocked`.
If the prompt continues that work, resume that plan instead of creating a new one.

## Step 1 — Triage

| Prompt kind | Action |
| --- | --- |
| Pure question / discussion, no file changes | Answer directly. No plan. |
| Tiny change (one file, a few lines, no design decision) | Create a plan with a single task, delegate to `task-worker`. |
| Anything else | Full plan (Step 2+). |

When in doubt, plan.

## Step 2 — Plan

1. Read only what you need: `CLAUDE.md`, the relevant sections of `docs/SPEC.md`, and the
   files the change will touch. Delegate broad exploration to an `Explore` subagent instead of reading many files yourself.
2. Create `docs/handoffs/<YYYY-MM-DD>-<kebab-slug>/PLAN.md` from `_templates/PLAN.md`.
3. Split the work into tasks. A good task:
   - has **one clear outcome** a reviewer can verify,
   - touches a **small, named set of files** (aim ≤ ~5),
   - can be finished by one subagent without asking questions,
   - has explicit **acceptance criteria** and a **verification command** where possible.
4. For each task write `T<NN>-<slug>.md` from `_templates/TASK.md`, filling only the **Brief** section.
   The brief must be self-contained: the subagent sees nothing but the brief and the repo.
5. Record dependencies in the PLAN task table. Tasks whose file sets overlap must be sequential.

## Step 3 — Delegate

- Spawn one `task-worker` subagent per ready task. Prompt it with **only** the path of its task file, e.g.
  `Execute the task in docs/handoffs/2026-11-04-scaffold-app/T01-tauri-vue-scaffold.md`.
- Launch independent tasks (no dependency, disjoint files) **in parallel in a single message**.
  If they must touch the same files, run them sequentially, or use `isolation: "worktree"`.
- After each worker returns, read its task file's **Handoff** section (not just the agent's reply) and
  update the status in `PLAN.md`.

## Step 4 — React to handoffs

| Worker status | Orchestrator action |
| --- | --- |
| `done` | Mark done; pass its "Notes for next tasks" into dependent briefs. |
| `needs-split` | Subagents cannot spawn subagents. Turn its *Proposed split* into new task files (`T03a`, `T03b`, …), add them to the plan, delegate. |
| `blocked` | If you can resolve it (missing info in the brief), amend the brief and re-delegate. If it needs a user decision, stop and ask the user. |

## Step 5 — Review

For any task that changed code, spawn a `task-reviewer` with the task file path (in parallel for
independent tasks). It appends a **Review** section. If it reports `changes-requested`, create a fix
task (`T<NN>-fix`) or re-delegate the original with the review notes.

## Step 6 — Close

1. Fill the **Outcome** section of `PLAN.md`, set `Status: done` (or `blocked` with the reason).
2. If product behaviour changed, make sure `docs/SPEC.md` was updated.
3. Commit: if every task is `done` and every review is `approved`, invoke the **`commit`** skill to
   commit the plan's changes, including its handoff files. One commit per logical change — usually one
   per plan; split by task if the plan contains unrelated changes. If the plan ends `blocked`, don't
   commit; tell the user what's left uncommitted. Never push unless the user asks.
4. Reply to the user: what was done, what was verified (and how), what's open, and the commit
   hash(es) with their headers. Link the plan file.

Pure-question prompts (no plan) never commit.

## Rules

- Keep your own context lean: don't read file dumps a subagent can summarise into a handoff.
- Never mark a task done that the handoff doesn't show as verified.
- Handoff files are the source of truth — if the agent's chat reply and the file disagree, trust the file and investigate.
- Never add a Claude/Anthropic co-author trailer or "Generated with Claude Code" attribution to commits.
