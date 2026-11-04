# Riftbound Scorer — Product Specification

> Source of truth for *what* the app does. Agents: read only the sections relevant to your task.
> Original sketch: [`docs/Riftbound scorer App layout.png`](./Riftbound%20scorer%20App%20layout.png)

## 1. Goal

A small cross-platform app that helps two Riftbound players track **score** and **match time** in a
**1v1** match. The phone lies in the middle of the table; each player sees their half of the screen
facing them.

Targets, built from **one codebase**:

- **iOS and Android** — native apps via Tauri.
- **PWA** — the same app served as a Progressive Web App, installable from the browser
  (e.g. "Add to Home Screen").

Every target has the same features and the same offline guarantee.

### Principles

- **Fully offline / local.** No internet connection, no account, no telemetry, no backend.
- **Fast at the table.** Every common action is one or two taps.
- **Readable from both sides.** The opponent's half of the screen is rotated 180°.
- **Never lose a match.** State is persisted after every action, so an app kill / restart resumes the match.

## 2. Tech stack

| Concern        | Choice                                                    |
| -------------- | --------------------------------------------------------- |
| App shell      | Tauri 2 (mobile: iOS + Android; desktop works for dev)    |
| Web / PWA      | `vite-plugin-pwa` (web app manifest + Workbox service worker) |
| UI framework   | Vue 3, `<script setup>`, TypeScript, Vite                 |
| Styling        | Tailwind CSS                                              |
| State          | Pinia                                                     |
| Persistence    | Behind a `StorageAdapter` interface. Native (Tauri): SQLite via the Tauri SQL plugin (`tauri-plugin-sql`), in the app's private data directory. PWA: IndexedDB (a small wrapper such as `idb` is allowed) |
| Tests          | Vitest for game logic (scoring, turns, undo, timers)      |

Game logic (scoring rules, turn tracking, undo, timers) lives in plain TypeScript modules with no
Vue/Tauri dependency so it can be unit tested.

**Platform adapters.** Platform-specific code (storage, screen keep-awake, anything from Tauri) lives
behind small adapters that are chosen at runtime by detecting Tauri (e.g. `isTauri()` from
`@tauri-apps/api/core`). Game logic and UI never import Tauri directly, so the same code runs both
inside Tauri and in a plain browser.

Why SQLite (native target):

- Each action is written in one atomic transaction, so a match can't be corrupted if the app is killed mid-write.
- It scales well as the match history grows (no rewriting one big file).
- The database is private to the app, needs no OS permissions, and works fully offline.

Why IndexedDB (PWA target): the Tauri SQL plugin isn't available in browsers; IndexedDB is the
browser's built-in store, transactional, persistent, and works offline.

### 2.1 PWA requirements

- **Fully offline after the first load.** The service worker precaches all app assets; the app makes
  no runtime network requests.
- **Installable.** Web app manifest with name "Riftbound Scorer", icons (192 px, 512 px, plus a
  maskable icon), `display: standalone`, portrait orientation, and theme/background colours matching
  the dark UI.
- **Safe updates.** New versions are picked up by the service worker. The app shows an unobtrusive
  "Update available — reload" prompt and **never reloads automatically during a running match**.
- **Storage durability.** Call `navigator.storage.persist()` on first launch. Browsers (especially
  iOS Safari) may still evict data of a site that isn't installed, so installing to the home screen
  is recommended. *Should-have:* a short hint about this on first launch / Home.
- **Screen keep-awake.** Screen Wake Lock API in the PWA (the Tauri equivalent natively); re-acquire
  the lock on `visibilitychange`. Best effort — if unsupported, the app still works.
- **Browsers.** Must work in current Safari (iOS) and Chrome (Android), plus desktop browsers for
  development.

## 3. Screens & flows

```
First launch ─► Home (Match History) ─► Start New Match ─► Match Score Screen ─► (match end) ─► Home
                     │                                          ▲
                     └──────────── resume unfinished match ─────┘
```

### 3.1 First-time usage

- Shown only when no nickname is stored.
- Text: "Hello Riftbounder", input "Your Nickname", confirm button.
- Nickname is saved locally and used as the default "Your Name" for new matches.
- Nickname can be changed later (e.g. from Home / settings).

### 3.2 Home screen — Match History

- Header "Match History" with a **+** button → Start New Match.
- List of past matches, newest first, formatted `Player1 (8) vs (6) Player2`. A match ended by resignation is marked as resigned (e.g. a "Resigned" tag naming who resigned).
- If a match is unfinished, it is shown at the top with a "Resume" affordance.
- *Should-have:* tap a past match to see its details (score log, total time, per-turn times).
- *Should-have:* delete a match from history.

### 3.3 Start new match

- Shows `Your Name  vs.  Frenemy`.
- "Your Name" defaults to the stored nickname, "Frenemy" to a placeholder.
- **Tapping a name edits it for this match only** (does not change the stored nickname).
- Choose which player takes the first turn (default: you).
- **Start** → Match Score Screen; game timer and turn 1 timer start.

### 3.4 Match Score Screen (core)

The screen is split horizontally into two halves:

- **Bottom half** faces "you", **top half** faces the opponent (rotated 180°).
- A divider in the middle; the active player's half is visually emphasised.

Each half contains:

- **Score track** (shared, one upright column along the left edge, not mirrored): each player's 0 is at their own outer end and the single **8** sits at the centre divider. The bottom player's score climbs from the bottom, the top player's descends from the top; each current score is **highlighted** in the player's colour (bottom blue, top rose, matching the dot by their name). Players start at 0.
- **Score log inside the track:** each track row shows the code (see 3.6) of the event that raised that player's score to that step, e.g. `CMT2`, `HOT4`; the 8 row shows the winning code. Events that awarded no point are shown struck-through on the row of the player's score at that time. There is no separate log list. The top player's step numbers and codes are rotated 180° so they face that player (the 8 row faces the winner, upright until someone reaches 8).
- **Player name.**
- Action buttons:
  - **Conquer** → opens the Score Pop-up (type = conquer).
  - **Hold** → opens the Score Pop-up (type = hold).
  - **Special Score** → gives +1 point directly (cards/effects that grant a point), on the current turn.
  - **Pass Turn** → ends the current turn; the turn counter goes up by 1 and the other player becomes active.
  - **Resign** → the player gives up; the other player wins (see 4.1). Needs a confirmation step so it can't be triggered by an accidental tap. Hidden/disabled once the match is over.
  - **Disabled states** → Conquer/Hold are greyed out once that player scored both battlefields this turn; Hold is also greyed out for the non-active player (holding only happens on your own turn); Pass Turn is greyed out for the non-active player. Tapping a greyed button does not start the flow; it shows a small dismissable notice in that player's half explaining why ("You already scored both battlefields this turn." / "You can only hold on your turn." / "It's not your turn."), which clears when the condition ends. Everything is natively disabled once the match is over.
  - **Undo** → reverts the most recent action in the match, whichever player did it (see 4.4).
    Both halves have their own Undo button; they behave identically.
- **Final point hint** (only when it applies, see 4.3) — shown on that player's half, facing them.

Also on the screen:

- **Game timer** — total elapsed match time.
- **Current turn number** (e.g. "Turn 7") — shown next to or as part of the turn timer, readable from
  both halves.
- **Turn timer** — elapsed time of the current turn; every turn's duration is recorded.
- *Should-have:* after an Undo, a short toast on the half that pressed it says what was undone,
  e.g. "Undid: Conquer (Opponent) T7 — Frenemy".
- *Should-have:* pause/resume timers, and keep the screen awake during a match.

### 3.5 Score Pop-up (faces the player who opened it)

- **Battlefield:** segmented toggle `My battlefield` / `Opponent's battlefield` — whose battlefield the point
  was scored on. Nothing is preselected; the player must choose one, and **Score Point +1** stays
  disabled until they do.
- **Turn:** pre-filled with the current global turn (see 4.2), so players normally never touch it.
  Tapping it opens a **numeric keypad** to correct it — the exception, for points entered late.
  A corrected value must be between 1 and the current turn (inclusive).
- **Score Point +1** confirms and adds the point (subject to the final point rule, see 4.3).
  Tapping outside / cancel closes without scoring.
- **Already scored:** if this player already scored the selected battlefield in the selected turn
  (see 4.6), an amber message explains that each battlefield can only be scored once per turn and
  **Score Point +1** is disabled. It updates when the battlefield or turn is changed.

Special Score has no pop-up; it always uses the current turn.

### 3.6 Score log code

`<Type><Battlefield>T<Turn>`

| Part         | Values                                            |
| ------------ | ------------------------------------------------- |
| Type         | `C` conquer, `H` hold, `S` special                |
| Battlefield  | `M` my battlefield, `O` opponent's (omitted for `S`) |
| Turn         | turn number, e.g. `T4`                           |
| Denied       | suffix `✕` on a conquer that gave no point because of the final point rule (see 4.3) |

Examples: `CMT2` = conquered my battlefield on turn 2; `HOT4` = held opponent's battlefield on turn 4; `ST5` = special point on turn 5;
`CMT7✕` = conquered my battlefield on turn 7 at 7 points, denied by the final point rule (no point).

A denied entry is shown in the log in a distinct (muted/struck) style with a short label
"no point — draw a card". It does not move the score track.

## 4. Game logic

### 4.1 Score & win

- Each player starts at 0. Victory score is **8** (1v1).
- Reaching 8 ends the match: timers stop, a result screen/overlay shows the winner, match is saved to history.
  Gaining the winning point (7 → 8) by **Conquer** is restricted by the final point rule (4.3);
  Hold and Special Score always give it.
- A player can also **resign** at any time while the match is running: the other player wins immediately, scores stay as they are, timers stop (an open pause is closed, the open turn ends), and the match is saved as resigned. Resigning after the match is over is not possible.
- Score can never go below 0 or above 8.

### 4.2 Turns

- There is **one global turn counter for the whole match**. It starts at 1 when the match starts and
  every **Pass Turn** increments it by 1, no matter which player passed: 1, 2, 3, 4, …
  (turn 1 = first player, turn 2 = second player, turn 3 = first player, …).
- The app always knows the current turn: scoring defaults to it (see 3.5) and it is shown on the
  Match Score Screen (see 3.4).
- Each turn records: number, active player, start time, end time (→ duration).

### 4.3 Final point rule

Riftbound rule: a player who would gain their **winning point (7 → 8) by conquering** only gains it
if they have **scored every battlefield this turn**. In 1v1 there are two battlefields — "My" and
"Opponent" (from the scoring player's view). Otherwise they draw a card instead of gaining the point.
A **Hold** always gives the winning point; only Conquer is restricted. **Special Score** is not
affected by this rule.

The app enforces this as a helper:

- **Scored this turn:** a battlefield counts as scored this turn for a player if they logged a Conquer
  or Hold on it during the current turn — including a conquer that was denied by this rule.
- **Denied conquer:** if a player at 7 points logs a Conquer and has not scored the other battlefield
  this turn, the app **still logs the conquer** but adds **no point**; the score stays at 7. The log
  entry is marked as denied (code suffix `✕`, e.g. `CMT7✕`; distinct style plus the label
  "no point — draw a card", see 3.6).
- **Hint:** at the same time, the app shows a hint on that player's half, facing them, naming the
  battlefield that still needs scoring this turn, e.g.
  "Final point: score the opponent's battlefield this turn to win".
- **Resolution:** if that player then scores the other battlefield in the same turn (Conquer or Hold),
  the rule is satisfied: they gain the point, reach 8 and win. The hint disappears.
- **Pass Turn** clears the hint. The denied entry stays in the log.
- **Undo** of a denied conquer removes the entry and its hint (see 4.4). Undoing a Pass Turn restores
  the hint if it was showing at the end of that turn, since the turn is open again.

### 4.6 One score per battlefield per turn

Each battlefield can be scored only **once per player per turn**, by Conquer or Hold. This includes a
conquer denied by the final point rule. The game logic rejects a repeat; Special Score is unaffected.
Undo frees the battlefield again.

### 4.4 Undo

- The match keeps a single ordered history of actions: score events (including denied conquers and
  special scores), pass-turn and resign.
- Both halves have an **Undo** button. Either one reverts the **most recent action in the match, no
  matter which player did it**. Repeated presses keep stepping back through the history.
- Undoing a Pass Turn restores the previous turn number, the active player, and that turn's timer,
  so the turn is open again.
- Undoing a denied conquer removes it and its final point hint.
- Undoing the winning point reopens the match. Undoing a resignation likewise reopens it (no winner, timers running again).
- *Should-have:* a short toast on the half that pressed Undo says what was undone,
  e.g. "Undid: Conquer (Opponent) T7 — Frenemy".

### 4.5 Persistence

- Storage goes through the `StorageAdapter` interface (see §2):
  - **Native (Tauri):** SQLite via the Tauri SQL plugin (`tauri-plugin-sql`), database in the app's
    private data directory.
  - **PWA:** IndexedDB in the browser.
- Settings (the nickname) live in the same store as the matches. See §2 for the rationale.
- Every action (and every Undo) is persisted in its own atomic transaction on both targets (one
  SQLite transaction / one IndexedDB transaction per action). On app start, an unfinished match can
  be resumed.
- Data is per device and per browser. There is no sync between devices or between the native app
  and the PWA (see §7).
- Timers are derived from stored timestamps (not from an in-memory tick counter), so they survive app restarts.

## 5. Data model (draft)

```ts
type PlayerIndex = 0 | 1;              // 0 = you (bottom), 1 = opponent (top)

interface Settings { nickname: string }

interface Match {
  id: string;
  createdAt: number;                   // epoch ms
  endedAt?: number;
  players: [{ name: string }, { name: string }];
  firstPlayer: PlayerIndex;
  actions: MatchAction[];              // single ordered history, oldest first; Undo = remove the last entry
  winner?: PlayerIndex;
  pauses: { from: number; to?: number }[]; // timer pauses (open while `to` is unset); paused time is excluded from game/turn durations
}

type MatchAction = ScoreEvent | PassTurn | ResignAction;

interface ScoreEvent {
  kind: 'score';
  id: string;
  player: PlayerIndex;
  type: 'conquer' | 'hold' | 'special';
  battlefield?: 'mine' | 'opponent';   // undefined for special
  turn: number;                        // turn the point is credited to (defaults to the current turn)
  pointAwarded: boolean;               // false = conquer denied by the final point rule (code suffix ✕)
  at: number;                          // epoch ms
}

interface PassTurn {
  kind: 'pass';
  id: string;
  player: PlayerIndex;                 // player whose turn ended
  at: number;                          // epoch ms; end of that turn, start of the next
}

interface ResignAction {
  kind: 'resign';
  id: string;
  player: PlayerIndex;                 // player who resigned; the other player wins (`winner`, `endedAt = at`)
  at: number;                          // epoch ms
}

// Derived from `createdAt`, `firstPlayer` and the PassTurn actions — not stored separately.
interface Turn {
  number: number;
  activePlayer: PlayerIndex;
  startedAt: number;
  endedAt?: number;
}
```

Everything else is derived from `actions`: scores (count of `ScoreEvent`s with `pointAwarded`), the
current turn number and active player, whether the match was resigned (a `ResignAction` exists), per-turn durations, the final point hint, and the log codes.
Undo removes the last action and re-derives; nothing else needs restoring.

## 6. Non-functional requirements

- Works in portrait orientation on phones; usable with large touch targets (≥ 44 pt).
- No network access at runtime on any target: the native apps request no network permissions
  (beyond what Tauri needs for local dev), and the PWA makes no network requests after the first
  load (see §2.1).
- Dark-friendly, high-contrast UI (tables are often dimly lit).

## 7. Out of scope (for now)

- Multiplayer modes other than 1v1 (2v2, free-for-all).
- Accounts, cloud sync, online play.
- Syncing data between devices or between the native app and the PWA.
- Card/deck tracking.

## 8. Open questions

None currently.
