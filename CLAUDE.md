# Riftbound Scorer

Offline 1v1 score & match-timer app for Riftbound. Tauri 2 (iOS/Android) + PWA, Vue 3 + TypeScript + Tailwind CSS.

- **Product spec:** [docs/SPEC.md](docs/SPEC.md) — read the relevant sections when a task touches features; don't load it all by default.
- **UI sketch:** `docs/Riftbound scorer App layout.png`
- **Handoffs:** [docs/handoffs/](docs/handoffs/README.md) — plans and task briefs/results between agents.

## Workflow — mandatory for every prompt

1. Invoke the **`orchestrate`** skill before doing anything else.
2. The skill decides whether the prompt needs a plan. If it does, it splits the work into small tasks,
   writes them as handoff files under `docs/handoffs/`, and delegates them to the `task-worker` /
   `task-reviewer` subagents.
3. The main agent coordinates; it does not implement multi-file work itself.
4. Closing a plan commits its changes via the **`commit`** skill.

## Conventions

- Game logic (scoring, turns, undo, timers) is plain TypeScript, no Vue/Tauri imports, covered by Vitest.
- Platform-specific APIs (Tauri plugins, browser APIs like Wake Lock/IndexedDB) only behind adapters in one place; everything must run in both Tauri and a plain browser.
- Fully local: never add network calls, analytics, or account features.
- Update `docs/SPEC.md` when a decision changes product behaviour (and resolve the matching open question).
- Commits are made automatically by the orchestrator via the `commit` skill (Conventional Commits) when a plan closes. Never add Claude as co-author or any Claude attribution. Never push unless asked.
- Package manager: npm (commit `package-lock.json`; don't use pnpm/yarn).
