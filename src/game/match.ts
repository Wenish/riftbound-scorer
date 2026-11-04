import type {
  Battlefield,
  FinalPointHint,
  Match,
  MatchAction,
  MatchState,
  PassTurn,
  Pause,
  PlayerIndex,
  ResignAction,
  ScoreEvent,
  ScoreType,
  Turn,
} from './types'
import { WIN_SCORE } from './types'

export class GameError extends Error {}

const other = (p: PlayerIndex): PlayerIndex => (p === 0 ? 1 : 0)
const otherBf = (b: Battlefield): Battlefield => (b === 'mine' ? 'opponent' : 'mine')

export function createMatch(args: {
  id: string
  now: number
  names: [string, string]
  firstPlayer: PlayerIndex
}): Match {
  return {
    id: args.id,
    createdAt: args.now,
    players: [{ name: args.names[0] }, { name: args.names[1] }],
    firstPlayer: args.firstPlayer,
    actions: [],
    pauses: [],
  }
}

/** Milliseconds in [from, to] that are not covered by a pause. */
function activeTime(pauses: Pause[], from: number, to: number): number {
  if (to <= from) return 0
  let paused = 0
  for (const p of pauses) {
    const a = Math.max(p.from, from)
    const b = Math.min(p.to ?? to, to)
    if (b > a) paused += b - a
  }
  return to - from - paused
}

function currentTurnOf(actions: MatchAction[]): number {
  let n = 1
  for (const a of actions) if (a.kind === 'pass') n++
  return n
}

function scoredBattlefields(actions: MatchAction[], player: PlayerIndex, turn: number): Battlefield[] {
  const out: Battlefield[] = []
  for (const a of actions) {
    if (a.kind !== 'score' || a.player !== player || a.turn !== turn) continue
    if (a.type === 'special' || !a.battlefield) continue
    if (!out.includes(a.battlefield)) out.push(a.battlefield)
  }
  return out
}

function scoresOf(actions: MatchAction[]): [number, number] {
  const s: [number, number] = [0, 0]
  for (const a of actions) if (a.kind === 'score' && a.pointAwarded) s[a.player]++
  return s
}

export function deriveState(match: Match, now: number): MatchState {
  const scores = scoresOf(match.actions)
  const currentTurn = currentTurnOf(match.actions)
  const isOver = match.winner !== undefined
  const end = match.endedAt ?? now
  const activeAt = (n: number): PlayerIndex => (n % 2 === 1 ? match.firstPlayer : other(match.firstPlayer))

  const turns: Turn[] = []
  let start = match.createdAt
  for (const a of match.actions) {
    if (a.kind !== 'pass') continue
    turns.push({
      number: turns.length + 1,
      activePlayer: activeAt(turns.length + 1),
      startedAt: start,
      endedAt: a.at,
      duration: activeTime(match.pauses, start, a.at),
    })
    start = a.at
  }
  turns.push({
    number: currentTurn,
    activePlayer: activeAt(currentTurn),
    startedAt: start,
    endedAt: match.endedAt,
    duration: activeTime(match.pauses, start, end),
  })

  const scoredThisTurn: [Battlefield[], Battlefield[]] = [
    scoredBattlefields(match.actions, 0, currentTurn),
    scoredBattlefields(match.actions, 1, currentTurn),
  ]

  let finalPointHint: FinalPointHint | null = null
  if (!isOver) {
    for (const p of [0, 1] as PlayerIndex[]) {
      if (scores[p] !== WIN_SCORE - 1) continue
      const denied = match.actions.some(
        (a) => a.kind === 'score' && a.player === p && a.turn === currentTurn && !a.pointAwarded,
      )
      if (!denied) continue
      const missing = (['mine', 'opponent'] as Battlefield[]).find((b) => !scoredThisTurn[p].includes(b))
      if (missing) finalPointHint = { player: p, battlefield: missing }
    }
  }

  const last = match.pauses[match.pauses.length - 1]
  return {
    scores,
    currentTurn,
    activePlayer: activeAt(currentTurn),
    turns,
    winner: match.winner ?? null,
    isOver,
    resigned: match.actions.some((a) => a.kind === 'resign'),
    isPaused: !isOver && last !== undefined && last.to === undefined,
    gameDuration: activeTime(match.pauses, match.createdAt, end),
    finalPointHint,
    scoredThisTurn,
  }
}

/** Ordered log entries (incl. denied conquers) for one player. */
export function pointLog(match: Match, player: PlayerIndex): ScoreEvent[] {
  return match.actions.filter((a): a is ScoreEvent => a.kind === 'score' && a.player === player)
}

export function addScore(
  match: Match,
  args: {
    player: PlayerIndex
    type: ScoreType
    battlefield?: Battlefield
    turn?: number
    now: number
    id: string
  },
): Match {
  if (match.winner !== undefined) throw new GameError('Match is over')
  const currentTurn = currentTurnOf(match.actions)
  const turn = args.turn ?? currentTurn
  if (!Number.isInteger(turn) || turn < 1 || turn > currentTurn) {
    throw new GameError(`Turn must be between 1 and ${currentTurn}`)
  }
  if (args.type !== 'special' && !args.battlefield) throw new GameError('Battlefield required')
  const battlefield = args.type === 'special' ? undefined : args.battlefield

  const scores = scoresOf(match.actions)
  let pointAwarded = true
  if (args.type === 'conquer' && scores[args.player] === WIN_SCORE - 1) {
    const scored = scoredBattlefields(match.actions, args.player, turn)
    pointAwarded = scored.includes(otherBf(battlefield!))
  }

  const event: ScoreEvent = {
    kind: 'score',
    id: args.id,
    player: args.player,
    type: args.type,
    battlefield,
    turn,
    pointAwarded,
    at: args.now,
  }
  const next: Match = { ...match, actions: [...match.actions, event] }
  if (pointAwarded && scores[args.player] + 1 >= WIN_SCORE) {
    next.winner = args.player
    next.endedAt = args.now
    next.pauses = closePauses(match.pauses, args.now)
  }
  return next
}

export function passTurn(match: Match, args: { now: number; id: string }): Match {
  if (match.winner !== undefined) throw new GameError('Match is over')
  const player = deriveState(match, args.now).activePlayer
  const action: PassTurn = { kind: 'pass', id: args.id, player, at: args.now }
  return { ...match, actions: [...match.actions, action] }
}

/** Ends the match: `player` resigns and the other player wins. */
export function resign(match: Match, args: { player: PlayerIndex; now: number; id: string }): Match {
  if (match.winner !== undefined) throw new GameError('Match is over')
  const action: ResignAction = { kind: 'resign', id: args.id, player: args.player, at: args.now }
  return {
    ...match,
    actions: [...match.actions, action],
    winner: other(args.player),
    endedAt: args.now,
    pauses: closePauses(match.pauses, args.now),
  }
}

/** Removes the last action. Reopens the match if the winning point or a resignation is undone. */
export function undo(match: Match): { match: Match; undone: MatchAction | null } {
  if (match.actions.length === 0) return { match, undone: null }
  const undone = match.actions[match.actions.length - 1]
  const next: Match = { ...match, actions: match.actions.slice(0, -1) }
  if (match.winner !== undefined && (undone.kind === 'resign' || (undone.kind === 'score' && undone.pointAwarded))) {
    delete next.winner
    delete next.endedAt
  }
  return { match: next, undone }
}

function closePauses(pauses: Pause[], now: number): Pause[] {
  const last = pauses[pauses.length - 1]
  if (!last || last.to !== undefined) return pauses
  return [...pauses.slice(0, -1), { from: last.from, to: Math.max(now, last.from) }]
}

export function pauseMatch(match: Match, now: number): Match {
  if (match.winner !== undefined) return match
  const last = match.pauses[match.pauses.length - 1]
  if (last && last.to === undefined) return match
  return { ...match, pauses: [...match.pauses, { from: now }] }
}

export function resumeMatch(match: Match, now: number): Match {
  return { ...match, pauses: closePauses(match.pauses, now) }
}
