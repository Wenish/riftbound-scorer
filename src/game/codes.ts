import type { Match, MatchAction, ScoreEvent } from './types'

const TYPE_CODE = { conquer: 'C', hold: 'H', special: 'S' } as const
const TYPE_LABEL = { conquer: 'Conquer', hold: 'Hold', special: 'Special' } as const

/** Score log code, e.g. CMT2, HOT4, ST5, CMT7✕ (SPEC §3.6). */
export function scoreCode(event: ScoreEvent): string {
  const bf = event.type === 'special' ? '' : event.battlefield === 'opponent' ? 'O' : 'M'
  return `${TYPE_CODE[event.type]}${bf}T${event.turn}${event.pointAwarded ? '' : '✕'}`
}

/** Human description for the undo toast, e.g. "Conquer (Opponent) T7 — Frenemy". */
export function describeAction(match: Match, action: MatchAction): string {
  const name = match.players[action.player].name
  if (action.kind === 'pass') return `Pass turn — ${name}`
  let label: string = TYPE_LABEL[action.type]
  if (action.type !== 'special') {
    label += action.battlefield === 'opponent' ? ' (Opponent)' : ' (Mine)'
  }
  const denied = action.pointAwarded ? '' : ' (no point)'
  return `${label} T${action.turn} — ${name}${denied}`
}
