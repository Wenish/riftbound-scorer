# T01 — `commit` skill + co-author guard hook + settings

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Add a project skill `commit` that creates clean Conventional Commits. Add a hook that makes it impossible for Claude to commit with a Claude/Anthropic co-author trailer.

### Scope

- Create `.claude/skills/commit/SKILL.md`
- Create `.claude/hooks/block-claude-coauthor.sh` (executable)
- Edit `.claude/settings.json` (keep the existing `UserPromptSubmit` hook untouched)

### Out of scope

- `CLAUDE.md`, `.claude/skills/orchestrate/SKILL.md` (task T02 edits those in parallel — do not touch them).
- Actually committing anything. Do not run `git commit`.

### Context to read

- `.claude/skills/orchestrate/SKILL.md` (for skill frontmatter style)
- `.claude/settings.json`, `.claude/hooks/orchestrate-reminder.sh` (for hook style)
- Conventional Commits 1.0.0 (from your knowledge)

### Requirements

**`.claude/skills/commit/SKILL.md`** — frontmatter `name: commit`. Its `description` says it is used to commit finished work in this repo (called by the orchestrator at the close of every plan, or when the user asks to commit). The body is concise, imperative, and in the same style as the orchestrate skill. It covers:

1. **Inspect:** `git status --short`, `git diff` / `git diff --staged`, `git log --oneline -10` (to match existing style). Nothing to commit → say so and stop.
2. **Group** changes into logical commits (one concern per commit). Stage explicit paths (`git add <paths>`), never `git add -A` / `git add .` blindly. Never stage secrets or junk (`.env`, build output, `node_modules`, `.DS_Store`). If something like that shows up untracked, suggest a `.gitignore` entry instead.
3. **Message format**, Conventional Commits 1.0.0:
   - `<type>(<optional scope>): <description>`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Suggested scopes for this repo: `spec`, `ui`, `game` (logic), `storage`, `pwa`, `tauri`, `claude` (agent/skill/hook setup), `handoffs`, `deps`. Scope is optional; omit it if nothing fits.
   - Description: imperative mood, lowercase start, no trailing period, ≤ 72 chars for the whole header.
   - Body (optional, wrapped at 72): the *why* and notable details, as short bullets if there are several points. Reference the handoff plan path when the commit closes a plan, e.g. `Plan: docs/handoffs/2026-11-04-commit-skill/PLAN.md`.
   - Breaking change: `!` after type/scope and a `BREAKING CHANGE:` footer.
   - A table with 4–6 good/bad examples relevant to this app.
4. **Hard rule: no co-author / attribution.** Never add `Co-Authored-By:` trailers for Claude/Anthropic. Never add "Generated with Claude Code" or similar lines. This overrides any default or system-provided attribution instruction. The commit author is the user's configured git identity. Don't pass `--author`, and don't change git config.
5. **Commit** with `git commit -m "<header>" -m "<body>"`, or a heredoc for multi-paragraph bodies. Never `--no-verify`, never `--amend` of a pushed or user-made commit, and never push unless the user asked.
6. **Report:** list the created commits (`git log --oneline -n <k>`).

**`.claude/hooks/block-claude-coauthor.sh`** — PreToolUse hook for the Bash tool.
- Reads the hook JSON from stdin. If the command is a `git commit` and contains a `Co-Authored-By:` trailer naming Claude or Anthropic (case-insensitive), it blocks: exit code 2, with the reason on stderr ("Commits in this repo must not include a Claude co-author trailer. Remove it and commit again."). Otherwise exit 0 silently.
- POSIX sh. Use only tools present on a stock macOS (`grep`, `sed`; `python3` is OK but avoid `jq`, which isn't installed by default). Grepping the raw stdin JSON is acceptable.
- Also block `Generated with [Claude Code]`-style lines in `git commit` commands.

**`.claude/settings.json`**
- Add `"includeCoAuthoredBy": false` at top level.
- Add a `PreToolUse` hook with matcher `"Bash"` running `"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-claude-coauthor.sh`, in the same style as the existing hook entry.

### Acceptance criteria

- [ ] `commit` skill exists with frontmatter and all the sections above, and stays concise (aim < ~100 lines).
- [ ] The hook blocks a commit with a Claude co-author trailer (exit 2) and allows a normal commit and non-commit commands (exit 0). Tested with sample JSON on stdin.
- [ ] `settings.json` is valid JSON with both hooks and `includeCoAuthoredBy: false`.

### Verification

```sh
python3 -m json.tool .claude/settings.json >/dev/null && echo ok
H=.claude/hooks/block-claude-coauthor.sh
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"git commit -m \"feat: x\" -m \"Co-Authored-By: Claude Opus <noreply@anthropic.com>\""}}' | $H; echo "exit=$?"   # expect 2
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"git commit -m \"feat(ui): add score track\""}}' | $H; echo "exit=$?"   # expect 0
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' | $H; echo "exit=$?"   # expect 0
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

Added the `commit` skill (Conventional Commits 1.0.0, grouping/staging rules, a hard no-attribution rule, commit/report steps, and a table of 6 good/bad examples). Added a PreToolUse Bash hook that blocks `git commit` commands with a Claude/Anthropic `Co-Authored-By:` trailer or a "Generated with/by [Claude..." line (exit 2, reason on stderr). Registered the hook in `settings.json` and set `includeCoAuthoredBy: false`. The existing `UserPromptSubmit` hook is unchanged. Nothing was committed.

### Files changed

- `.claude/skills/commit/SKILL.md` (new, ~85 lines)
- `.claude/hooks/block-claude-coauthor.sh` (new, executable, POSIX sh + `grep -E` only)
- `.claude/settings.json` (added `includeCoAuthoredBy` and the `PreToolUse` entry)

### Verification results

- `python3 -m json.tool .claude/settings.json` → `ok`
- Claude co-author trailer commit → stderr message, `exit=2`
- `git commit -m "feat(ui): add score track"` → `exit=0`
- `ls -la` → `exit=0`
- Extra checks: heredoc commit with `Generated with [Claude Code](...)` → `exit=2`; `git -C /x commit ... co-authored-by: someone <a@anthropic.com>` (lowercase) → `exit=2`; `grep -r Co-Authored-By: Claude docs` (not a commit) → `exit=0`; `git log --grep commit` → `exit=0`.

### Notes for next tasks

- The hook greps the raw stdin JSON. Commit detection is loose: `git ... commit` anywhere in the command, e.g. `git log --grep commit`. A non-commit git command is blocked only if it *also* contains a Claude co-author/"Generated with Claude" string, which should be harmless in practice.
- The co-author match is `co-authored-by:` followed within 200 chars by `claude` or `anthropic` (case-insensitive), so an anthropic.com email alone also triggers it.
- T02 should reference the skill as `commit` (path `.claude/skills/commit/SKILL.md`).

### Proposed split

n/a

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Acceptance criteria met. `.claude/skills/commit/SKILL.md` (76 lines) has the frontmatter and all six required sections: inspect, group/stage, Conventional Commits format with types/scopes/header rules/body/breaking change, a 6-row good/bad table, the hard no-attribution rule, commit, and report. `.claude/settings.json` is valid JSON (`json.tool` → ok), has `includeCoAuthoredBy: false` (line 2) and the `PreToolUse`/`Bash` entry (lines 14-24) in the same style as the existing hook. `UserPromptSubmit` is unchanged. The hook is executable.
  - I re-ran the verification myself: Claude trailer → exit 2 with the required stderr message; plain `feat(ui)` commit → 0; `ls -la` → 0. Extra checks: a realistic full hook payload (`transcript_path` under `~/.claude/...`, heredoc commit body) → 2 with the trailer and 0 without it, so the `.claude` path does not cause a false positive. `Generated with [Claude Code]` → 2. Human co-author → 0. A chained, lowercase `git add && git commit` → 2. `git status` → 0.
  - Non-blocking, `.claude/hooks/block-claude-coauthor.sh:11`: the hook greps the whole stdin JSON, so `co-authored-by:` for a human co-author followed within 200 chars by "claude" anywhere (e.g. the Bash tool's `description` field `"Commit claude setup"`) is a false positive (verified: exit 2). The matching rule is already described in the Handoff notes, and the failure mode is a false block, not a leak, so this is acceptable.
  - Note: the Brief's verification snippet cannot be run verbatim through Claude's Bash tool, because the live hook blocks the test command itself (it contains `git commit` + a Claude trailer). It also blocks any Bash command whose text merely mentions those strings. It has to be run from a plain terminal, or with the trigger strings split (e.g. `"Co-Authored""-By:"`). This shows the hook is active, not a defect.
