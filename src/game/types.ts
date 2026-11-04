export type PlayerIndex = 0 | 1 // 0 = you (bottom), 1 = opponent (top)
export type Battlefield = 'mine' | 'opponent'
export type ScoreType = 'conquer' | 'hold' | 'special'

export const WIN_SCORE = 8

export interface Settings {
  nickname: string
}

/** A pause interval; `to` is undefined while the match is still paused. */
export interface Pause {
  from: number
  to?: number
}

export interface Match {
  id: string
  createdAt: number
  endedAt?: number
  players: [{ name: string }, { name: string }]
  firstPlayer: PlayerIndex
  actions: MatchAction[]
  winner?: PlayerIndex
  /** Timer pauses, oldest first. Paused time is excluded from game and turn durations. */
  pauses: Pause[]
}

export type MatchAction = ScoreEvent | PassTurn | ResignAction

export interface ScoreEvent {
  kind: 'score'
  id: string
  player: PlayerIndex
  type: ScoreType
  battlefield?: Battlefield
  turn: number
  pointAwarded: boolean
  at: number
}

export interface PassTurn {
  kind: 'pass'
  id: string
  player: PlayerIndex
  at: number
}

export interface ResignAction {
  kind: 'resign'
  id: string
  /** Who resigned; the other player wins. */
  player: PlayerIndex
  at: number
}

export interface Turn {
  number: number
  activePlayer: PlayerIndex
  startedAt: number
  endedAt?: number
  /** Duration in ms, excluding paused time; open turns are measured up to `now`. */
  duration: number
}

export interface FinalPointHint {
  player: PlayerIndex
  /** Battlefield (from the player's view) that still needs to be scored this turn. */
  battlefield: Battlefield
}

export interface MatchState {
  scores: [number, number]
  currentTurn: number
  activePlayer: PlayerIndex
  turns: Turn[]
  winner: PlayerIndex | null
  isOver: boolean
  /** True when the match ended by a resignation. */
  resigned: boolean
  isPaused: boolean
  /** Total game time in ms, excluding paused time. */
  gameDuration: number
  finalPointHint: FinalPointHint | null
  /** Battlefields each player has scored (conquer/hold, incl. denied) on the current turn. */
  scoredThisTurn: [Battlefield[], Battlefield[]]
}
