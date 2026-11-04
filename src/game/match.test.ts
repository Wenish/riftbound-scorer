import { describe, expect, it } from 'vitest'
import {
  GameError, addScore, createMatch, deriveState, passTurn, pauseMatch, pointLog, resign, resumeMatch, undo,
} from './match'
import { describeAction, scoreCode } from './codes'
import { formatDuration } from './format'
import type { Battlefield, Match, PlayerIndex, ScoreType } from './types'

let n = 0
const id = () => `a${++n}`
const mk = (first: PlayerIndex = 0) =>
  createMatch({ id: 'm', now: 0, names: ['Me', 'Frenemy'], firstPlayer: first })
const score = (m: Match, player: PlayerIndex, type: ScoreType, battlefield?: Battlefield, extra: { turn?: number; now?: number } = {}) =>
  addScore(m, { player, type, battlefield, turn: extra.turn, now: extra.now ?? 1000, id: id() })
const pass = (m: Match, now = 1000) => passTurn(m, { now, id: id() })

/** Bring player to 7 using specials. */
function to7(m: Match, p: PlayerIndex): Match {
  for (let i = 0; i < 7; i++) m = score(m, p, 'special')
  return m
}

describe('one score per battlefield per turn', () => {
  it('rejects a second conquer/hold on the same battlefield in a turn', () => {
    const m = score(mk(), 0, 'conquer', 'mine')
    expect(() => score(m, 0, 'hold', 'mine')).toThrow(GameError)
    expect(() => score(m, 0, 'conquer', 'mine')).toThrow(GameError)
  })

  it('allows the other battlefield, other turns, specials and the other player', () => {
    let m = score(mk(), 0, 'hold', 'mine')
    m = score(m, 0, 'hold', 'opponent')
    m = score(m, 0, 'special')
    m = score(m, 0, 'special')
    m = score(m, 1, 'hold', 'mine')
    m = pass(m)
    m = score(m, 0, 'hold', 'mine')
    expect(deriveState(m, 5000).scores).toEqual([5, 1])
    // backfilling an earlier turn is checked per turn
    expect(() => score(m, 0, 'hold', 'mine', { turn: 1 })).toThrow(GameError)
    expect(score(m, 1, 'hold', 'opponent', { turn: 1 }).actions).toHaveLength(m.actions.length + 1)
  })

  it('a denied conquer still blocks a repeat', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    expect(deriveState(m, 5000).scores[0]).toBe(7)
    expect(() => score(m, 0, 'conquer', 'mine')).toThrow(GameError)
    expect(() => score(m, 0, 'hold', 'mine')).toThrow(GameError)
  })
})

describe('scoring', () => {
  it('adds points and tracks scores', () => {
    let m = score(mk(), 0, 'conquer', 'mine')
    m = score(m, 1, 'hold', 'opponent')
    m = score(m, 0, 'special')
    expect(deriveState(m, 5000).scores).toEqual([2, 1])
  })

  it('requires battlefield for conquer/hold', () => {
    expect(() => score(mk(), 0, 'conquer')).toThrow(GameError)
  })

  it('reaching 8 ends the match and refuses further actions', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'hold', 'mine', { now: 9000 })
    const s = deriveState(m, 20000)
    expect(s.winner).toBe(0)
    expect(s.scores[0]).toBe(8)
    expect(m.endedAt).toBe(9000)
    expect(s.gameDuration).toBe(9000)
    expect(() => score(m, 0, 'special')).toThrow(GameError)
    expect(() => pass(m)).toThrow(GameError)
  })

  it('never exceeds 8', () => {
    const m = to7(mk(), 0)
    const won = score(m, 0, 'special')
    expect(() => score(won, 0, 'special')).toThrow()
    expect(deriveState(won, 0).scores[0]).toBe(8)
  })
})

describe('turns', () => {
  it('increments turn globally and alternates active player', () => {
    let m = mk(1)
    expect(deriveState(m, 0).activePlayer).toBe(1)
    m = pass(m, 100)
    m = pass(m, 250)
    const s = deriveState(m, 400)
    expect(s.currentTurn).toBe(3)
    expect(s.activePlayer).toBe(1)
    expect(s.turns.map((t) => [t.number, t.activePlayer, t.duration])).toEqual([
      [1, 1, 100], [2, 0, 150], [3, 1, 150],
    ])
    expect(m.actions[0]).toMatchObject({ kind: 'pass', player: 1 })
    expect(m.actions[1]).toMatchObject({ kind: 'pass', player: 0 })
  })

  it('validates corrected turn within 1..current', () => {
    let m = pass(pass(mk()))
    expect(score(m, 0, 'conquer', 'mine', { turn: 1 }).actions[2]).toMatchObject({ turn: 1 })
    expect(() => score(m, 0, 'conquer', 'mine', { turn: 0 })).toThrow(GameError)
    expect(() => score(m, 0, 'conquer', 'mine', { turn: 4 })).toThrow(GameError)
    expect(() => score(m, 0, 'conquer', 'mine', { turn: 1.5 })).toThrow(GameError)
    m = score(m, 0, 'hold', 'mine', { turn: 3 })
    expect(m.actions[2]).toMatchObject({ turn: 3 })
  })
})

describe('final point rule', () => {
  it('denies conquer at 7 without other battlefield, logs it, shows hint', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    const s = deriveState(m, 0)
    expect(s.scores[0]).toBe(7)
    expect(s.winner).toBeNull()
    expect(pointLog(m, 0).at(-1)).toMatchObject({ pointAwarded: false })
    expect(scoreCode(pointLog(m, 0).at(-1)!)).toBe('CMT1✕')
    expect(s.finalPointHint).toEqual({ player: 0, battlefield: 'opponent' })
  })

  it('resolves with conquer of the other battlefield', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    m = score(m, 0, 'conquer', 'opponent')
    const s = deriveState(m, 0)
    expect(s.winner).toBe(0)
    expect(s.finalPointHint).toBeNull()
  })

  it('resolves with hold of the other battlefield (hold always wins)', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    m = score(m, 0, 'hold', 'opponent')
    expect(deriveState(m, 0).winner).toBe(0)
  })

  it('allows conquer when other battlefield was held earlier this turn', () => {
    let m3 = score(mk(), 0, 'hold', 'opponent')
    for (let i = 0; i < 6; i++) m3 = score(m3, 0, 'special') // 7 total
    expect(deriveState(m3, 0).scores[0]).toBe(7)
    m3 = score(m3, 0, 'conquer', 'mine')
    expect(deriveState(m3, 0).winner).toBe(0)
  })

  it('does not restrict hold or special at 7', () => {
    expect(deriveState(score(to7(mk(), 0), 0, 'hold', 'mine'), 0).winner).toBe(0)
    expect(deriveState(score(to7(mk(), 1), 1, 'special'), 0).winner).toBe(1)
  })

  it('is cleared by pass turn but denied entry stays; new turn needs both again', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    m = pass(m)
    const s = deriveState(m, 0)
    expect(s.finalPointHint).toBeNull()
    expect(pointLog(m, 0).at(-1)?.pointAwarded).toBe(false)
    m = score(m, 0, 'conquer', 'opponent') // other bf not scored in turn 2
    expect(deriveState(m, 0).winner).toBeNull()
  })

  it('does not apply below 7', () => {
    const m = score(mk(), 0, 'conquer', 'mine')
    expect(pointLog(m, 0)[0].pointAwarded).toBe(true)
  })

  it('tracks battlefields scored this turn per player', () => {
    let m = score(mk(), 0, 'conquer', 'mine')
    m = score(m, 1, 'hold', 'opponent')
    expect(deriveState(m, 0).scoredThisTurn).toEqual([['mine'], ['opponent']])
    expect(deriveState(pass(m), 0).scoredThisTurn).toEqual([[], []])
  })
})

describe('undo', () => {
  it('returns null on empty history', () => {
    const m = mk()
    expect(undo(m)).toEqual({ match: m, undone: null })
  })

  it('undoes a normal score', () => {
    const m = score(mk(), 0, 'conquer', 'mine')
    const r = undo(m)
    expect(r.undone).toMatchObject({ type: 'conquer' })
    expect(deriveState(r.match, 0).scores).toEqual([0, 0])
  })

  it('undoes a special score', () => {
    const r = undo(score(mk(), 1, 'special'))
    expect(r.undone).toMatchObject({ type: 'special', player: 1 })
    expect(r.match.actions).toHaveLength(0)
  })

  it('undoes a pass and reopens the turn', () => {
    const m = pass(mk(), 500)
    const r = undo(m)
    expect(r.undone?.kind).toBe('pass')
    const s = deriveState(r.match, 800)
    expect(s.currentTurn).toBe(1)
    expect(s.activePlayer).toBe(0)
    expect(s.turns[0].duration).toBe(800)
  })

  it('undoes a denied conquer including its hint', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    const r = undo(m)
    expect(deriveState(r.match, 0).finalPointHint).toBeNull()
    expect(deriveState(r.match, 0).scores[0]).toBe(7)
  })

  it('undoing a pass restores the hint', () => {
    let m = to7(mk(), 0)
    m = score(m, 0, 'conquer', 'mine')
    m = pass(m)
    expect(deriveState(m, 0).finalPointHint).toBeNull()
    expect(deriveState(undo(m).match, 0).finalPointHint).toEqual({ player: 0, battlefield: 'opponent' })
  })

  it('undoing the winning point reopens the match', () => {
    let m = score(to7(mk(), 0), 0, 'hold', 'mine', { now: 7000 })
    expect(m.winner).toBe(0)
    const r = undo(m)
    expect(r.match.winner).toBeUndefined()
    expect(r.match.endedAt).toBeUndefined()
    expect(deriveState(r.match, 9000).isOver).toBe(false)
    expect(deriveState(r.match, 9000).scores[0]).toBe(7)
    m = score(r.match, 0, 'special')
    expect(m.winner).toBe(0)
  })

  it('does not mutate the original match', () => {
    const m = score(mk(), 0, 'special')
    undo(m)
    expect(m.actions).toHaveLength(1)
  })
})

describe('pauses and durations', () => {
  it('excludes paused time from game and turn durations', () => {
    let m = mk()
    m = pauseMatch(m, 1000)
    m = resumeMatch(m, 4000)
    m = pass(m, 5000)
    const s = deriveState(m, 6000)
    expect(s.turns[0].duration).toBe(2000)
    expect(s.turns[1].duration).toBe(1000)
    expect(s.gameDuration).toBe(3000)
    expect(s.isPaused).toBe(false)
  })

  it('open pause stops the clock at pause start', () => {
    const m = pauseMatch(mk(), 1000)
    expect(deriveState(m, 9000).gameDuration).toBe(1000)
    expect(deriveState(m, 9000).isPaused).toBe(true)
    expect(pauseMatch(m, 2000)).toBe(m)
  })

  it('pause spanning a pass splits correctly', () => {
    let m = pauseMatch(mk(), 1000)
    m = pass(m, 3000)
    m = resumeMatch(m, 4000)
    const s = deriveState(m, 5000)
    expect(s.turns[0].duration).toBe(1000)
    expect(s.turns[1].duration).toBe(1000)
  })

  it('winning closes an open pause', () => {
    let m = pauseMatch(to7(mk(), 0), 1000)
    m = score(m, 0, 'special', undefined, { now: 3000 })
    expect(deriveState(m, 10000).gameDuration).toBe(1000)
    expect(deriveState(m, 10000).isPaused).toBe(false)
  })
})

describe('resign', () => {
  const res = (m: Match, player: PlayerIndex, now = 2000) => resign(m, { player, now, id: id() })

  it('gives the win to the opponent and keeps scores', () => {
    let m = score(mk(), 0, 'special')
    const a = res(m, 0)
    expect(deriveState(a, 5000)).toMatchObject({ winner: 1, isOver: true, resigned: true, scores: [1, 0] })
    const b = res(m, 1)
    expect(deriveState(b, 5000)).toMatchObject({ winner: 0, isOver: true, resigned: true, scores: [1, 0] })
    expect(deriveState(m, 5000).resigned).toBe(false)
  })

  it('is rejected once the match is over', () => {
    const m = res(mk(), 0)
    expect(() => res(m, 1)).toThrow(GameError)
    expect(() => score(m, 0, 'special')).toThrow(GameError)
  })

  it('stops timers and closes an open pause', () => {
    let m = pass(mk(), 1000)
    m = pauseMatch(m, 1500)
    m = res(m, 1, 3000)
    const s = deriveState(m, 99999)
    expect(m.endedAt).toBe(3000)
    expect(s.gameDuration).toBe(1500)
    expect(s.turns[1].duration).toBe(500)
    expect(s.isPaused).toBe(false)
  })

  it('is undone by undo, reopening the match', () => {
    const before = pauseMatch(pass(score(mk(), 0, 'special')), 1500)
    const m = res(before, 0, 3000)
    const r = undo(m)
    expect(r.undone?.kind).toBe('resign')
    expect(r.match.winner).toBeUndefined()
    expect(r.match.endedAt).toBeUndefined()
    expect(deriveState(r.match, 4000).isOver).toBe(false)
    expect(deriveState(r.match, 4000).resigned).toBe(false)
    expect(r.match.actions).toEqual(before.actions)
  })

  it('describes resign for the undo toast', () => {
    const m = res(mk(), 1)
    expect(describeAction(m, m.actions[0])).toBe('Resign — Frenemy')
  })
})

describe('codes and formatting', () => {
  const ev = (o: object) => ({ kind: 'score', id: 'x', player: 0, type: 'conquer', battlefield: 'mine', turn: 2, pointAwarded: true, at: 0, ...o }) as never
  it('builds score codes', () => {
    expect(scoreCode(ev({}))).toBe('CMT2')
    expect(scoreCode(ev({ type: 'hold', battlefield: 'opponent', turn: 4 }))).toBe('HOT4')
    expect(scoreCode(ev({ type: 'special', battlefield: undefined, turn: 5 }))).toBe('ST5')
    expect(scoreCode(ev({ turn: 7, pointAwarded: false }))).toBe('CMT7✕')
  })

  it('describes actions for the undo toast', () => {
    let m = score(mk(), 1, 'conquer', 'opponent')
    expect(describeAction(m, m.actions[0])).toBe('Conquer (Opponent) T1 — Frenemy')
    m = pass(m)
    expect(describeAction(m, m.actions[1])).toContain('Pass turn')
    m = score(m, 0, 'special')
    expect(describeAction(m, m.actions[2])).toBe('Special T2 — Me')
  })

  it('formats durations', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(65_000)).toBe('01:05')
    expect(formatDuration(3_599_999)).toBe('59:59')
    expect(formatDuration(3_600_000)).toBe('1:00:00')
    expect(formatDuration(3_725_000)).toBe('1:02:05')
    expect(formatDuration(-5)).toBe('00:00')
  })
})
