# T01 — Apply safe-area insets to all views

- **Status:** done
- **Plan:** [PLAN.md](./PLAN.md)
- **Depends on:** –

## Brief

### Goal

In standalone PWA mode on a phone with a notch/status bar, all content sits inside the safe area; the background still fills the whole screen.

### Scope

- Files to change: `src/style.css`, `src/App.vue`, and the root element of each view in `src/views/*.vue` (including `MatchView.vue`) as needed. Prefer one central mechanism (e.g. a utility class or CSS in `src/style.css` using `env(safe-area-inset-top/right/bottom/left)`, or Tailwind arbitrary values like `pt-[env(safe-area-inset-top)]`) over scattering ad-hoc values.
- Remember MatchView's top half is rotated 180°: the physical top of the screen is the *rotated* half's visual top, so the top inset must be applied to the outer container (outside the rotation), and the bottom inset likewise, not inside the rotated child.
- `env()` resolves to 0 in a normal browser tab, so nothing changes there.

### Out of scope

- Changing the status-bar style, manifest, icons, or game logic.
- Redesigning layouts.

### Context to read

- `index.html` (viewport-fit=cover already set), `src/style.css`, `src/App.vue`, `src/views/MatchView.vue` and the other views' root elements.

### Acceptance criteria

- [ ] Top, bottom, left and right safe-area insets are respected by every view's root layout.
- [ ] MatchView: the rotated top half's controls are not under the status bar, and the bottom half's controls are not under the home indicator; the shared score track isn't clipped by side insets.
- [ ] Page background still covers the full screen (no light/white bars at the edges).
- [ ] `npm run build` and `npm test` pass.

### Verification

```sh
npm run build
npm test
```

(Real device behaviour can't be tested here; state that plainly in the handoff.)

---

## Handoff

_(Filled by task-worker.)_

### Summary
One central mechanism: `.safe-area` (padding from `env(safe-area-inset-*)`) on the App `<main>`, which keeps `bg-slate-950`, so the background fills the full screen and all views sit inside the insets. Views previously sized with `min-h-dvh`/`h-dvh` now use `min-h-safe-dvh`/`h-safe-dvh` (100dvh minus top/bottom insets) so they don't overflow the padded main. MatchView's insets are applied outside its rotated half, so the rotated top half sits below the status bar and the bottom half above the home indicator; left/right padding keeps the score track unclipped. `html, body` background set to slate-950 to avoid light bars on overscroll. `env()` is 0 in a normal browser tab.

### Files changed
- src/style.css
- src/App.vue
- src/views/HomeView.vue, MatchDetailView.vue, NewMatchView.vue, OnboardingView.vue, MatchView.vue

### Verification results
- `npm run build`: passed.
- `npm test`: passed (53 tests, 3 files).
- Real device / notch behaviour NOT tested (not possible here).

### Notes for next tasks
The MatchView score popup is `fixed inset-0` and does not apply insets itself; its panel is p-4 and could slightly overlap the notch region on a very tall inset. Not changed (out of scope).

### Proposed split

---

## Review

- **Verdict:** approved
- **Findings:**
  - All acceptance criteria met. `src/App.vue:26` applies `.safe-area` once on the `<main>` (outside MatchView's rotated half), so top/bottom/left/right insets cover every view. The `<main>` keeps `bg-slate-950` and `html, body` is set in `src/style.css`, so the background still fills the screen. Tailwind's border-box sizing means `min-h-dvh` on main plus the views' `min-h-safe-dvh` / `h-safe-dvh` (`src/views/MatchView.vue:86`) does not overflow.
  - I ran `npm run build` and `npm test` myself; both pass (53 tests). Device behaviour was not testable.
  - Non-blocking: the MatchView popup (`src/views/MatchView.vue:159`, `fixed inset-0`) ignores the insets, as the worker noted. It is out of scope here.
