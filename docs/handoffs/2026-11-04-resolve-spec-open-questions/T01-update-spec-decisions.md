# T01 — Update SPEC.md with resolved decisions

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

Update `docs/SPEC.md` with the four product decisions below. Remove them from §8 "Open questions". Keep the spec consistent everywhere they are touched.

### Scope

- Files to change: `docs/SPEC.md` only.

### Out of scope

- Any code, `CLAUDE.md`, `.claude/`, other handoff files.
- New features beyond the decisions below.

### Context to read

- `docs/SPEC.md` (whole file — it is short)
- `docs/handoffs/2026-11-04-resolve-spec-open-questions/PLAN.md` → Decisions

### Decisions to write into the spec

**1. Turn counter (§4.2, §3.4)**
One global counter for the whole match. It starts at 1. Every **Pass Turn** increments it by 1 (1, 2, 3, 4 …), no matter which player passed. This is no longer an assumption; state it as the rule.

**2. Automatic turn detection (§3.5)**
The app should always know which turn a point is scored on, so players never have to think about it:
- The Score Pop-up's Turn field is pre-filled with the current global turn. Special Score uses the current turn too.
- Correcting it with the numeric keypad is the exception, for points entered late. A corrected value cannot exceed the current turn or go below 1.
- The current turn number is shown on the Match Score Screen, readable from both halves, next to or as part of the turn timer.

**3. Final point rule (new subsection, e.g. §4.2 "Final point rule" — renumber as needed)**
Riftbound rule: when a player would gain their **winning point (7 → 8) by conquering**, they only gain it if they have **scored every battlefield this turn**. In 1v1 there are two battlefields, "My" and "Opponent". Otherwise they draw a card instead of gaining the point. A **Hold** always gives the winning point. Only Conquer is restricted.

App behaviour:
- A battlefield counts as "scored this turn" if the player logged a Conquer or Hold on it during the current turn. This includes a conquer that was denied by this rule.
- If a Conquer at 7 points does not satisfy the rule, the app **still logs the conquer** with **no point added**. The score stays at 7. The log entry is visibly marked as denied: a distinct style plus a short label such as "no point — draw a card". Its code gets a marker; define one, e.g. `CMT7✕`.
- At the same time, the app shows a hint on that player's half, facing them, e.g. "Final point: score the opponent's battlefield this turn to win". It names the specific battlefield that still needs scoring this turn.
- If the player then scores the other battlefield in the same turn (Conquer or Hold), the rule is satisfied. They gain the point and win.
- The hint disappears on Pass Turn. The denied entry stays in the log.
- Special Score is not affected by this rule.
- Undo correctly reverts a denied conquer, including its hint.
- Update §3.6 (log code) with the denied marker. Update §4.1 so "Reaching 8" mentions this rule.

**4. Undo (§3.4, §4.3)**
Both halves have an **Undo** button. Either button reverts the **most recent action in the match, no matter which player did it** (score event, denied conquer, special score, or pass turn). Repeated presses keep going back through the history. Undoing a Pass Turn restores the previous turn number, the active player, and that turn's timer, so the turn is open again. Undoing the winning point reopens the match.
Optional, describe it as a should-have: a short toast on the half that pressed Undo saying what was undone, e.g. "Undid: Conquer (Opponent) T7 — Frenemy".

**5. Persistence (§2, §4.4)**
Decision: **SQLite via the Tauri SQL plugin** (`tauri-plugin-sql`). The database lives in the app's private data directory. Rationale, kept short in the spec:
- Each action is an atomic transaction, so a match can't be corrupted if the app is killed.
- It scales well for a growing match history.
- It is private to the app, needs no OS permissions, and works fully offline.
Settings (the nickname) go in the same database.
Replace the "decided in the scaffolding task" wording in §2. Update §4.4 accordingly.

**6. Data model (§5)**
Adjust if needed to support the above. For example, `ScoreEvent` needs a way to mark a denied final-point conquer, such as `pointAwarded: boolean`. Make sure an Undo can be expressed as removing the last entry of a single ordered action history. Add an explicit `actions` log or document that `events` + `turns` are ordered by timestamp; pick one and keep it simple.

**7. §8 Open questions**
Remove the four resolved questions. If nothing is left, write "None currently."

### Acceptance criteria

- [ ] §4.2 states the global turn counter as a rule, not an assumption.
- [ ] §3.5 describes the pre-filled turn, its bounds, and that the current turn is shown on screen.
- [ ] The final point rule is a clear subsection that covers: the trigger (7 → 8 via Conquer), the "every battlefield this turn" condition, the denied-entry log marker, the hint, how it resolves, the hint clearing on Pass Turn, and Undo.
- [ ] §3.4 and §4.3 describe a global Undo on both halves.
- [ ] §2 and §4.4 name SQLite via the Tauri SQL plugin, with a short rationale.
- [ ] §5 data model supports the denied conquer and the ordered action history.
- [ ] §8 no longer lists these questions.
- [ ] No contradictions remain anywhere in the spec (search for "assumption").

### Verification

```sh
grep -n -i "assumption" docs/SPEC.md   # no leftover mentions of the resolved assumptions
grep -n -i "final point" docs/SPEC.md
git diff --stat                          # only docs/SPEC.md (and this task file) changed
```

---

## Handoff

_(Filled by task-worker.)_

### Summary

All four decisions written into `docs/SPEC.md`:

- §2: Persistence row now names SQLite via `tauri-plugin-sql` (private app data dir), plus a 3-bullet "Why SQLite" rationale.
- §3.4: Pass Turn increments the counter; Undo is global on both halves (see 4.4); final point hint on the player's half; current turn number shown next to the turn timer; should-have Undo toast.
- §3.5: Turn pre-filled with the current global turn; keypad correction is for late entries, bounded 1..current turn; Special Score uses the current turn.
- §3.6: new "Denied" row, `✕` suffix (e.g. `CMT7✕`), distinct style + label "no point — draw a card".
- §4.1: "Reaching 8" points to the final point rule (Conquer restricted; Hold/Special always give it).
- §4.2: global turn counter stated as the rule (no "assumption").
- §4.3 (new) Final point rule: trigger, "every battlefield this turn" condition (incl. denied conquers), denied log entry, hint naming the missing battlefield, resolution, cleared on Pass Turn, Special not affected, Undo behaviour.
- Renumbered: Undo is now **§4.4**, Persistence **§4.5**. Undo = most recent action of the match, repeated presses step back, Pass Turn undo restores turn number/active player/turn timer, winning point undo reopens the match.
- §5: `Match.events` + `Match.turns` replaced by one ordered `actions: MatchAction[]` (`ScoreEvent | PassTurn`, discriminated by `kind`). `ScoreEvent.pointAwarded: boolean` marks denied conquers. `Turn` is documented as derived. Undo = remove last action and re-derive.
- §8: "None currently."

### Files changed

- `docs/SPEC.md`
- this task file (status + Handoff)

### Verification results

- `grep -n -i "assumption" docs/SPEC.md` → no matches.
- `grep -n -i "final point" docs/SPEC.md` → matches in §3.4, §3.5, §3.6, §4.1, §4.3, §4.4, §5 (all consistent).
- `git diff --stat` → empty, because `docs/` is still untracked (git status shows only `?? .claude/`, `?? CLAUDE.md`, `?? docs/`). No files outside `docs/SPEC.md` and this task file were touched.
- Cross-references (`see 4.x`) checked by grep after the renumbering.

### Notes for next tasks

- Section numbers changed: Undo §4.3 → §4.4, Persistence §4.4 → §4.5. Any brief that cites the old numbers should be updated.
- Undoing a Pass Turn also brings back a final point hint that was showing at the end of that turn, since the turn is open again. This follows from the derived model; it wasn't asked for explicitly.
- Not covered by the decisions, so left unspecified: a late entry (Turn corrected to an earlier turn) logged while the player is at 7. The spec evaluates "scored this turn" over actions logged during the current turn. Whether a back-dated Conquer at 7 should also be checked against the rule is still open; it is an edge case for the game-logic task to raise if it matters.

### Proposed split

n/a

---

## Review

_(Filled by task-reviewer.)_
