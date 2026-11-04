# Handoffs

Markdown files that carry work between the orchestrator (main agent) and its subagents.
They are the source of truth for what was planned, what was done, and how it was verified.

## Layout

```
docs/handoffs/
  README.md                         ← this file
  _templates/PLAN.md, TASK.md       ← copy these
  2026-11-04-scaffold-app/          ← one folder per user request
    PLAN.md                         ← goal, task table, decisions, outcome (orchestrator only)
    T01-tauri-vue-scaffold.md       ← Brief (orchestrator) + Handoff (worker) + Review (reviewer)
    T02-tailwind-setup.md
    T02a-...md                      ← created when a task was split
```

Folder name: `<YYYY-MM-DD>-<kebab-slug>`. Task file: `T<NN>-<kebab-slug>.md`; split subtasks get a letter suffix.

## Who writes what

| Section                | Written by     |
| ---------------------- | -------------- |
| `PLAN.md` (all)        | orchestrator   |
| Task → Brief           | orchestrator   |
| Task → Status + Handoff| `task-worker`  |
| Task → Review          | `task-reviewer`|

## Status values

`todo` → `in-progress` → `done` | `needs-split` | `blocked`
Plans: `in-progress` | `done` | `blocked`.

## Flow

1. Orchestrator writes `PLAN.md` and task briefs.
2. Orchestrator spawns a `task-worker` per ready task with just the task file path (parallel when independent).
3. Worker does the work, verifies, fills the Handoff, sets status.
4. Orchestrator reads the Handoff; on `needs-split` it creates the subtasks; on `blocked` it fixes the brief or asks the user.
5. `task-reviewer` appends a Review for code-changing tasks.
6. Orchestrator writes the plan Outcome, commits via the `commit` skill, and reports to the user (with the commit hashes).

Subagents cannot spawn their own subagents, so further splitting always goes back through the orchestrator via `needs-split`.
