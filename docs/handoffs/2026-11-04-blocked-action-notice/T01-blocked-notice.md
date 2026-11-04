# T01 — Blocked-action notice

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In `PlayerHalf.vue`: when `scoreDisabled` is true, tapping Conquer/Hold emits nothing and instead shows a small dismissable notice in that half ("You already scored both battlefields this turn."). When `passDisabled` is true, tapping Pass Turn emits nothing and shows "It's not your turn.". Blocked buttons keep the grey look + `aria-disabled`; they are natively `disabled` only when the `disabled` prop (match over) is true. The notice has a ≥44px dismiss (×) button, sits where it doesn't cover the action buttons (e.g. the empty flex-1 area above the toast/buttons), uses `role="status"`, is cleared when the blocking condition ends (watch the props) and is replaced by a newer one.

### Scope

- Files: `src/components/match/PlayerHalf.vue`, `docs/SPEC.md` (§3.4 "Disabled states" line: describe disabled buttons not starting the flow and showing a dismissable reason; remove the "stay tappable for corrections" wording). Do not touch `src/views/MatchView.vue`.

### Acceptance criteria

- [ ] Blocked Conquer/Hold/Pass emit no events; a reason notice appears in that player's half (right way up for the top player, since the half is rotated).
- [ ] Notice dismissable via ×; auto-clears when the condition no longer applies.
- [ ] Not-blocked buttons behave as before; match over → natively disabled, no notice.
- [ ] SPEC updated.

### Verification

```sh
npm run typecheck && npm test
```

---

## Handoff

_(Filled by task-worker.)_

### Summary
Blocked Conquer/Hold/Pass now show a dismissable role=status notice in the flex-1 area; no emit. Notice cleared via props watchers.

### Files changed
src/components/match/PlayerHalf.vue, docs/SPEC.md

### Verification results
npm run typecheck && npm test: both passed (typecheck clean, 53 tests pass)

### Notes for next tasks

### Proposed split

---

## Review

_(Filled by task-reviewer.)_

- **Verdict:** approved
- **Findings:**
  - Verified: typecheck and 53 tests pass. Blocked Conquer/Hold/Pass emit nothing and set a notice (`src/components/match/PlayerHalf.vue` tapScore/tapPass); notice is role=status with a 44px (size-11) x button in the flex-1 area, replaced by newer notices, cleared by prop watchers and when `disabled` (match over); buttons natively disabled only via `disabled`; grey look plus aria-disabled retained. SPEC section 3.4 updated.
  - Note (non-blocking): `src/views/MatchView.vue` has uncommitted divider-layout changes in the working tree; they were pre-existing in git status and are not part of this task, so keep them out of this task's commit.
  - Note (non-blocking): no component test covers the notice behaviour; none was required.
